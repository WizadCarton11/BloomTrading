import os
import pandas as pd
from statsmodels.tsa.seasonal import seasonal_decompose
from data_scraper import StockDataScraper
from custom_logger import CustomLogger
import datetime
from custom_exceptions import raise_custom_exception, ScraperError, CustomException
import os
import pandas as pd
import numpy as np
from statsmodels.tsa.seasonal import seasonal_decompose
from data_scraper import StockDataScraper
from custom_logger import CustomLogger
import datetime
from custom_exceptions import *
import plotly.graph_objects as go
from sqlalchemy import create_engine, text
from datetime import timedelta
from sqlalchemy import inspect
from kafka import KafkaProducer
import json
import time
from dotenv import load_dotenv
load_dotenv(override=True)
class StockDataAnalyser:
    """
    Class for analysing stock data
    """
    def __init__(self, stock_symbol):
        self.stock_symbol: str = stock_symbol
        timestamp = datetime.datetime.now().strftime("%Y%m%d")
        self.logger = CustomLogger("StockDataAnalyser", log_file=f'./Logs/stock_data_analyser/{timestamp}.log').get_logger()
        self.stock_data=None
        self.processing_columns= ['open', 'high', 'low', 'close', 'volume']
        self.scraper = StockDataScraper(stockSymbol=self.stock_symbol)
        self.engine = create_engine(os.getenv('POSTGRES_URI'))
        producer = KafkaProducer(
            bootstrap_servers= os.getenv('KAFKA_URI'),
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )



    def fetch_stock_data_and_store(self, mode: str='csv') -> pd.DataFrame:
        try:
            self.logger.info(f"Checking first if the table exists in the database...")
            table_exists: bool=self._check_if_table_exists(self.stock_symbol)
            if not table_exists:
                self.logger.info(f"Table does not exist in the database. Hence fetch full data from scraper.")
                df: pd.DataFrame=self.scraper.getStockData(compact=False)
            else:
                self.logger.info(f"Table exists in the database. Hence fetch compact data from scraper.")
                df: pd.DataFrame=self.scraper.getStockData(compact=True)
            df.columns = [col.lower() for col in df.columns]
            df['index'] = df.index
            df['used']=False
            self.logger.info(f"Fetched data from Alpha Vantage API.")
            self.logger.info(f"Fetching analysed data...")
            analysed_data: pd.DataFrame=self._get_analysed_data(df)
            self.logger.info(f"Fetched analysed data.")
            if mode == 'csv':
                self.logger.info(f"Saving data to CSV file...")
                analysed_data.to_csv(f'./stock_data/{self.stock_symbol}_data.csv')
                self.logger.info(f"Saved stock data to CSV file: {self.stock_symbol}_data.csv")
            elif mode == 'db':
                self.logger.info(f"Saving data to database...")
                if table_exists:
                    self.logger.info(f"Table exists in the database. Hence replacing the data.")
                    latest_data = self._sql_execute(query=f"SELECT * FROM {self.stock_symbol.lower()} ORDER BY index DESC LIMIT 1")
                    latest_data = latest_data.iloc[0]
                    analysed_data = analysed_data[analysed_data['index'] > latest_data['index']]
                    if analysed_data.empty:
                        self.logger.info(f"No new data to insert into the database.")
                        return None
                    else:
                        # make index the primary key
                        analysed_data.set_index('index', inplace=True)
                        analysed_data.to_sql(self.stock_symbol.lower(), self.engine, if_exists='append', index=True)
                else:
                    analysed_data.to_sql(self.stock_symbol.lower(), self.engine, if_exists='append', index=True)
                self.logger.info(f"Saved stock data to database: {self.stock_symbol}")
            else:
                raise_custom_exception(ScraperError, message=f"Invalid mode: {mode}. Use 'csv' or 'db'.")
            self.stock_data = analysed_data
            return analysed_data
        except Exception as e:
            raise_custom_exception(ScraperError, message=f"Error in StockDataAnalyser->fetch_stock_data_and_store: {e}")
            return None   

    def generate_today_stock_data(self) -> pd.DataFrame:
        """
        Generate today's stock data using the waveform generation method.
        """
        try:
            self.logger.info(f"Generating today's stock data for {self.stock_symbol}...")
            latest_unused_data = self._sql_execute(query=f"SELECT * FROM {self.stock_symbol.lower()} WHERE used = False ORDER BY index DESC LIMIT 2")
            if latest_unused_data.empty:
                self.logger.info(f"No unused data found for {self.stock_symbol}. Fetching new data...")
                self.fetch_stock_data_and_store(mode='db')
                latest_unused_data = self._sql_execute(query=f"SELECT * FROM {self.stock_symbol.lower()} WHERE used = False ORDER BY index DESC LIMIT 2")
                if latest_unused_data.empty:
                    self.logger.info(f"No new data found for {self.stock_symbol}.")
                    return None
            next_day_volume = latest_unused_data['volume'].iloc[0] 
            
            latest_unused_data = latest_unused_data.iloc[1]
            # self.logger.info(f"Latest unused data: {latest_unused_data['index']}")
            waveform_length = 9500
            rise_point = np.random.uniform(0.1, 0.5)
            fall_point = np.random.uniform(0.5, 0.9)
            if np.random.rand() < 0.5:
                fall_point, rise_point = rise_point, fall_point
            y_vals=self._generate_waveform(
                    length=waveform_length,
                    rise_point=rise_point,
                    fall_point=fall_point,
                    max_amplitude=latest_unused_data['high'],
                    min_amplitude=latest_unused_data['low'],
                    final_value=latest_unused_data['close'],
                    start_value=latest_unused_data['open']
                )
            
            fixed_date = pd.Timestamp(datetime.datetime.now().strftime("%Y-%m-%d"))

            # Create a start datetime at midnight
            start_datetime = pd.Timestamp(fixed_date.replace(hour=10, minute=0, second=0))

            # Create evenly spaced times within the fixed date
            time_range = pd.date_range(start=start_datetime, periods=waveform_length, end=start_datetime + timedelta(days=1) - timedelta(hours=6))
            volume_array = np.round( np.linspace(latest_unused_data['volume'], next_day_volume, waveform_length) + np.random.normal(0, 1, waveform_length)).astype(int)
            dataframe= pd.DataFrame({
                'price': y_vals,
                'stock_symbol': self.stock_symbol,
                'timestamp': time_range
            })
            dataframe['volume'] = volume_array
            dataframe['change'] = dataframe['price'].diff().fillna(0)
            dataframe['changePercent'] = (dataframe['change'] / dataframe['price'].shift(1)).fillna(0) * 100
            inspector = inspect(self.engine)

            if 'today' not in inspector.get_table_names():
                # Create table by inserting the schema (use replace or fail)
                dataframe.head(0).to_sql('today', self.engine, if_exists='replace', index=False)

            # Now safely append
            # dataframe.to_sql('today', self.engine, if_exists='append', index=False)
            dataframe.to_csv(f'./stock_data/{self.stock_symbol} .csv', index=False, mode='w')
            self.logger.info(f"Today's stock data generated and stored in the database for {self.stock_symbol}.")
            return dataframe
        except Exception as e:
            print(e)
            raise_custom_exception(ScraperError, message=f"Error in StockDataAnalyser->generate_today_stock_data: {e}")
            return None
    
    def upload_stock_data_to_kafka(self):
        """
        Upload stock data to Kafka.
        """
        try:
            self.logger.info(f"Uploading stock data for {self.stock_symbol} to Kafka...")
            stock_data = self._sql_execute(f"SELECT * FROM today where stock_symbol = \'{self.stock_symbol}\' ORDER BY index ")
            if stock_data.empty:
                self.logger.info(f"No stock data found for {self.stock_symbol}.")
                return None
            producer = KafkaProducer(
                bootstrap_servers=os.getenv('KAFKA_URI'),
                value_serializer=lambda v: json.dumps(v).encode('utf-8')
            )
            
            for _, row in stock_data.iterrows():
                # print(row)
                message = {
                    'symbol': self.stock_symbol,
                    'data': row['price'],
                }
                producer.send(self.stock_symbol.tolower(), value=message)
                # print(f"Sent data for {self.stock_symbol} to Kafka: {message}")
                self.logger.info(f"Sent data for {self.stock_symbol} to Kafka: {message}")
                # sleep for 1 second to avoid overwhelming the Kafka broker
                time.sleep(1)
            producer.flush()
            self.logger.info(f"Stock data for {self.stock_symbol} uploaded to Kafka successfully.")
        except Exception as e:
            raise_custom_exception(ScraperError, message=f"Error in StockDataAnalyser->upload_stock_data_to_kafka: {e}")

    def get_stock_data(self)-> pd.DataFrame:
        try:
            return self._sql_execute(query=f"Select * from {self.stock_symbol.lower()}")
        except Exception as e:
            raise_custom_exception(DatabaseError, message=f"Error in StockDataAnalyser->get_stock_data: {e}")
        
    def get_stock_company_info(self) -> dict:
        """
        Get stock company information.
        """
        try:
            info = self.scraper.getStockInfo()
            if not info:
                raise_custom_exception(ScraperError, message=f"Failed to fetch stock info for {self.stock_symbol}.")
            df= pd.DataFrame.from_dict(info, orient='index').T
            df.columns = [col.lower() for col in df.columns]
            info = df.to_dict(orient='records')[0]
            info['symbol'] = self.stock_symbol
            self.logger.info(f"Fetched stock company info for {self.stock_symbol}.")
            df.to_sql('stock_info', self.engine, if_exists='append', index=False)
            return info
        except Exception as e:
            raise_custom_exception(ScraperError, message=f"Error in StockDataAnalyser->get_stock_company_info: {e}")
            return None

    def _check_if_table_exists(self, table_name: str) -> bool:
        """
        Check if a table exists in the database.
        """
        try:
            with self.engine.connect() as connection:
                result = connection.execute(text(f"SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='{table_name.lower()}');"))
                exists = result.scalar()
            return exists
        except Exception as e:
            raise_custom_exception(ScraperError, message=f"Failed to check if table exists: {e}")
            return False

    def _sql_execute(self, query: str):
        """
        Execute a SQL query and return the result as a DataFrame.
        """
        try:
            with self.engine.connect() as connection:
                result = connection.execute(text(query))
                df = pd.DataFrame(result.fetchall(), columns=result.keys())
            return df
        except Exception as e:
            raise_custom_exception(ScraperError, message=f"Failed to execute SQL query: {e}")
            return None
    
    def _get_analysed_data(self, stock_data: pd.DataFrame) -> pd.DataFrame:
        try:
            stock_data= self._getSeasonalDecomposition(stock_data)
            stock_data= stock_data[::-1].reset_index(drop=True)
            stock_data= self._get_bollinger_bands(stock_data)
            stock_data= stock_data[::-1].reset_index(drop=True)
            return stock_data
        except Exception as e:
            raise_custom_exception(ScraperError, message=f"Failed to get seasonal decomposition: {e}")
            return None

    def _getSeasonalDecomposition(self, stock_data: pd.DataFrame) -> pd.DataFrame:
        """
        Perform seasonal decomposition on stock data.
        """
        for col in self.processing_columns:
            result = seasonal_decompose(stock_data[col], model='additive', period=25)
            stock_data[f'{col}_Trend'] = result.trend
            stock_data[f'{col}_Seasonal'] = result.seasonal
            stock_data[f'{col}_Residual'] = result.resid
        return stock_data 
    
    def _get_bollinger_bands(self, data: pd.DataFrame, bollinger_window: int =20, short_window: int =20):
        """
        Calculate Bollinger Bands using previous N records in chronological order.
        Ensures Bollinger values exist for the latest dates (top of DataFrame).
        """
        
        for col in self.processing_columns:
            rolling_mean = data[col].rolling(window=bollinger_window).mean()
            rolling_std = data[col].rolling(window=bollinger_window).std()
            data[f'{col}_EMA'] = data[col].ewm(span=short_window, adjust=False).mean()
            data[f'{col}_Bollinger_Upper'] = rolling_mean + (2 * rolling_std)
            data[f'{col}_Bollinger_Lower'] = rolling_mean - (2 * rolling_std)

        return data
    
    def _generate_waveform(self, length, fall_point=0.3, rise_point=0.7, max_amplitude=1.0, min_amplitude=-1.0, final_value=0.5, start_value=0.5):
        # Create normalized x-axis from 0 to 1
        max_amplitude = start_value - max_amplitude
        min_amplitude = start_value - min_amplitude
        final_value = start_value - final_value
        print("Generating waveform...")
        x_axis = np.linspace(0, 1, length)
        waveform = np.zeros_like(x_axis)

        if fall_point < rise_point:
            # Falling segment
            fall_mask = x_axis <= fall_point
            waveform[fall_mask] = max_amplitude * np.sin((np.pi * x_axis[fall_mask]) / (2 * fall_point))

            # Rising segment
            rise_mask = (x_axis > fall_point) & (x_axis <= rise_point)
            waveform[rise_mask] = max_amplitude + (min_amplitude - max_amplitude) * \
                (1 - np.cos(np.pi * (x_axis[rise_mask] - fall_point) / (rise_point - fall_point))) / 2

            # Tail segment to final value
            tail_mask = x_axis > rise_point
            t = (x_axis[tail_mask] - rise_point) / (1 - rise_point)
            start_tail_value = min_amplitude
            waveform[tail_mask] = start_tail_value + (final_value - start_tail_value) * \
                (1 - np.cos(np.pi * t)) / 2

        else:
            # Rising segment
            rise_mask = x_axis <= rise_point
            waveform[rise_mask] = min_amplitude * np.sin((np.pi * x_axis[rise_mask]) / (2 * rise_point))

            # Falling segment
            fall_mask = (x_axis > rise_point) & (x_axis <= fall_point)
            waveform[fall_mask] = min_amplitude + (max_amplitude - min_amplitude) * \
                (1 - np.cos(np.pi * (x_axis[fall_mask] - rise_point) / (fall_point - rise_point))) / 2

            # Tail segment to final value
            tail_mask = x_axis > fall_point
            t = (x_axis[tail_mask] - fall_point) / (1 - fall_point)
            start_tail_value = max_amplitude
            waveform[tail_mask] = start_tail_value + (final_value - start_tail_value) * \
                (1 - np.cos(np.pi * t)) / 2

        # Optional: Add noise to simulate realism
        for i in range(length):
            waveform[i] += np.random.normal(-0.005, 0.005)
            # if waveform[i] > max_amplitude+1:
            #     waveform[i] = max_amplitude
            # elif waveform[i] <= min_amplitude:
            #     waveform[i] = min_amplitude + np.random.normal(0.1, 0.5)

        waveform = np.nan_to_num(waveform)

        return waveform + start_value