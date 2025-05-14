import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from tensorflow import keras
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
import pandas as pd
from stock_data_analyser import *
from custom_exceptions import *
import datetime
from minio_handler import MinIOHandler
from dotenv import load_dotenv
import joblib
from sklearn.metrics import r2_score, mean_absolute_error
import matplotlib.pyplot as plt
load_dotenv(override=True)
class StockPriceNN:
    def __init__(self, stock_symbol):
        self.sda= StockDataAnalyser(stock_symbol=stock_symbol)
        self.df=None
        # self.df = df.copy()
        self.model = None
        self.scalerX = StandardScaler()
        self.scalerY = StandardScaler()
        self.stock_symbol = stock_symbol
        timestamp = datetime.datetime.now().strftime("%Y%m%d")
        self.minio_handler=MinIOHandler(
            endpoint=os.getenv("MINIO_ENDPOINT"),
            access_key=os.getenv("MINIO_ACCESS_KEY"),
            secret_key=os.getenv("MINIO_SECRET_KEY"),
            bucket_name=os.getenv("MINIO_BUCKET_NAME"),
            secure=False
        )
        self.logger = CustomLogger("StockPriceNN", log_file=f'./Logs/stock_price_nn/{timestamp}.log').get_logger()
        

    def preprocess(self):
        try:
        # data=self.sda.fetch_and_store_stock_data(mode='sql')
            self.df=self.sda.fetch_from_db()
            y = self.df[['High', 'Low']].values
            X = self.df.drop(columns=['Open', 'High', 'Low', 'Volume', 'EMA','Close',
                                    'Bollinger_Upper', 'Close_Lag1', 'Bollinger_Lower',
                                    'Trend', 'Stock_name', 'index']).values
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=12)

            self.X_train = self.scalerX.fit_transform(X_train)
            self.X_test = self.scalerX.transform(X_test)
            self.y_train = self.scalerY.fit_transform(y_train)
            self.y_test = self.scalerY.transform(y_test)
            joblib.dump(self.scalerX, f'scalers/scalerX_{self.stock_symbol}.pkl')
            joblib.dump(self.scalerY, f'scalers/scalerY_{self.stock_symbol}.pkl')
            self.minio_handler.upload_file(file_path=f'scalers/scalerX_{self.stock_symbol}.pkl', object_name=f'scalers/scalerX_{self.stock_symbol}.pkl')
            self.minio_handler.upload_file(file_path=f'scalers/scalerY_{self.stock_symbol}.pkl', object_name=f'scalers/scalerY_{self.stock_symbol}.pkl')
        except CustomException as e:
            self.logger.error(f"A custom error occurred at StockPriceNN->preprocess: {e}")
            return None
        except Exception as e:
            self.logger.error(f"An error occurred at StockPriceNN->preprocess: {e}")
            return None

    def predict(self, x_input):
        try:
            x_input = self.scalerX.transform(x_input)
            return self.scalerY.inverse_transform(self.model.predict(x_input))
        except CustomException as e:
            self.logger.error(f"A custom error occurred at StockPriceNN->predict: {e}")
            return None
        except Exception as e:
            self.logger.error(f"An error occurred at StockPriceNN->predict: {e}")
            return None

    def build_model(self, input_dim):
        try:
            self.model = keras.Sequential([
                keras.layers.Dense(256, activation='relu', input_shape=(18,)),
                keras.layers.Dropout(0.1),
                keras.layers.Dense(128, activation='relu'),
                keras.layers.Dropout(0.2),
                keras.layers.Dense(64, activation='relu'),
                keras.layers.Dropout(0.1),
                keras.layers.Dense(32, activation='relu'),
                keras.layers.Dense(4)
            ])
            self.model.compile(optimizer='adam', loss='mean_squared_error', metrics=['mae'])
        except CustomException as e:
            self.logger.error(f"A custom error occurred at StockPriceNN->build_model: {e}")
            return None
        except Exception as e:
            self.logger.error(f"An error occurred at StockPriceNN->build_model: {e}")
            return None

    def load_model(self):
        try:
            # self.minio_handler.download_file(object_name=f'{self.stock_symbol}_best_model.keras', destination_path=f'models/{self.stock_symbol}_best_model.keras')
            self.minio_handler.download_file(object_name=f'scalers/scalerX_{self.stock_symbol}.pkl', destination_path=f'scalers/scalerX_{self.stock_symbol}.pkl')
            self.minio_handler.download_file(object_name=f'scalers/scalerY_{self.stock_symbol}.pkl', destination_path=f'scalers/scalerY_{self.stock_symbol}.pkl')
            self.model = keras.models.load_model(f'models/{self.stock_symbol}_best_model.keras')
            self.scalerX = joblib.load(f'scalers/scalerX_{self.stock_symbol}.pkl')
            self.scalerY = joblib.load(f'scalers/scalerY_{self.stock_symbol}.pkl')
        except CustomException as e:
            self.logger.error(f"A custom error occurred at StockPriceNN->load_model: {e}")
            return None
        except Exception as e:
            self.logger.error(f"An error occurred at StockPriceNN->load_model: {e}")
            return None
    

    def train(self, epochs=200):
        try:
            early_stop = EarlyStopping(monitor='val_loss', patience=15, restore_best_weights=True, verbose=1)
            checkpoint = ModelCheckpoint(filepath=f'models/{self.stock_symbol}_best_model.keras', monitor='val_loss', save_best_only=True, verbose=1)
            
            self.build_model(input_dim=self.X_train.shape[1])
            self.model.fit(
                self.X_train, self.y_train,
                epochs=epochs,
                batch_size=32,
                validation_data=(self.X_test, self.y_test),
                callbacks=[early_stop, checkpoint]
            )
            self.minio_handler.upload_file(file_path=f'models/{self.stock_symbol}_best_model.keras', object_name=f'models/{self.stock_symbol}_best_model.keras')
        except CustomException as e:
            self.logger.error(f"A custom error occurred at StockPriceNN->train: {e}")
            return None
        except Exception as e:
            self.logger.error(f"An error occurred at StockPriceNN->train: {e}")
            return None

    def evaluate(self):
        try:
            loss, mae = self.model.evaluate(self.X_test, self.y_test)
            print(f"Test MAE: {mae:.2f}")
            print(f"Test Loss: {loss:.2f}")
            return mae
        except CustomException as e:
            self.logger.error(f"A custom error occurred at StockPriceNN->evaluate: {e}")
            return None
        except Exception as e:
            self.logger.error(f"An error occurred at StockPriceNN->evaluate: {e}")
            return None


    def plot_predictions(self):
        try:
            y_train_pred = self.scalerY.inverse_transform(self.model.predict(self.X_train))
            y_test_pred = self.scalerY.inverse_transform(self.model.predict(self.X_test))
            y_train_actual = self.scalerY.inverse_transform(self.y_train)
            y_test_actual = self.scalerY.inverse_transform(self.y_test)

            target_names = ["Close", "Open", "High", "Low"]
            color_map = ["blue", "orange", "purple", "brown"]

            def plot_scatter_fit(y_true, y_pred, title, feature_idx, color):
                r2 = r2_score(y_true[:, feature_idx], y_pred[:, feature_idx])
                mae = mean_absolute_error(y_true[:, feature_idx], y_pred[:, feature_idx])

                plt.figure(figsize=(10, 6))
                plt.scatter(y_true[:, feature_idx], y_pred[:, feature_idx], alpha=0.5, color=color, label="Predictions")
                plt.plot(y_true[:, feature_idx], y_true[:, feature_idx], color='black', linestyle='dashed', label="Ideal Fit")
                plt.xlabel(f"Actual {target_names[feature_idx]} Price")
                plt.ylabel(f"Predicted {target_names[feature_idx]} Price")
                plt.title(f"{title}\nR²: {r2:.3f} | MAE: {mae:.2f}")
                plt.grid(True, linestyle='--', alpha=0.7)
                plt.legend()
                plt.tight_layout()
                plt.show()

            def plot_line_vs_index(y_true, y_pred, title, feature_idx, color):
                r2 = r2_score(y_true[:, feature_idx], y_pred[:, feature_idx])
                mae = mean_absolute_error(y_true[:, feature_idx], y_pred[:, feature_idx])

                plt.figure(figsize=(10, 6))
                plt.scatter(range(len(y_true)), y_true[:, feature_idx], label="Actual", color='blue')
                # plt.scatter(y_true[:, feature_idx], label="Actual", color='green')
                plt.plot(range(len(y_pred)),y_pred[:, feature_idx], label="Predicted", color=color, linestyle='--')
                plt.xlabel("Index")
                plt.ylabel(f"{target_names[feature_idx]} Price")
                plt.title(f"{title}\nR²: {r2:.3f} | MAE: {mae:.2f}")
                plt.grid(True, linestyle='--', alpha=0.7)
                plt.legend()
                plt.tight_layout()
                plt.show()

            # Plot Training Scatter
            for i in range(y_train_actual.shape[1]):
                plot_scatter_fit(y_train_actual, y_train_pred, f"Training Data: Actual vs Predicted {target_names[i]}", i, color_map[i])

            # Plot Testing Line
            for i in range(y_test_actual.shape[1]):
                plot_line_vs_index(y_test_actual, y_test_pred, "Testing Data: Actual vs Predicted" + target_names[i], i, color_map[i])

        except CustomException as e:
            self.logger.error(f"A custom error occurred at StockPriceNN->plot_predictions: {e}")
            return None
        except Exception as e:
            self.logger.error(f"An error occurred at StockPriceNN->plot_predictions: {e}")
            return None

