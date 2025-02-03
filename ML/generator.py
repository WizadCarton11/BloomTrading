import requests
import os
import pandas as pd
import yfinance as yf
import matplotlib.pyplot as plt
import numpy as np
from stock_data_analyser import StockDataAnalyser
from linear_regression import SelfLinearRegression

def initiator():
    stock_symbols = ["AAPL"]
    
    # stock_symbols = ["AAPL"]
    
    for stock_symbol in stock_symbols:

        analyser = StockDataAnalyser(stock_symbol)
        stock_data = analyser.fetch_and_plot_stock_data()
        
def linear_regression_on_stock(stock_data):
    # try:
        columns=["Bollinger_Upper", "Bollinger_Lower",
                                    "Close_Lag2", "Close_Lag3", "Close_Lag4",
                                    "Close_Lag5", "Close_Lag6", "Close_Lag7", 
                                    "Close_Lag8", "Close_Lag9", "Close_Lag10",
                                    "Close_Lag11", "Close_Lag12", "Close_Lag13",
                                    "Close_Lag14", "Close_Lag15", "Close_Lag16",
                                    "Close_Lag17", "Close_Lag18", "Close_Lag19"]
        X=stock_data.loc[:stock_data.shape[0]-50, columns].to_numpy() 
                            
        y = stock_data["Close"].loc[:stock_data.shape[0]-50].to_numpy()
        y1=pd.DataFrame(stock_data["Close"].loc[:stock_data.shape[0]-50])
        #print x and y object details
        
        model = SelfLinearRegression()
        model.fit(X, y, splitting="train-test")
        
        # x_test, y_test,y_pred = model.getScores()
        # plot the figure last 20 rows of the stock data
        x=stock_data.loc[stock_data.shape[0]-40:, columns].to_numpy()
        y_test=stock_data["Close"].loc[stock_data.shape[0]-40:].to_numpy()
        x_test=x[0].reshape(1, -1)
        y_pred=np.array([])
        print(x_test)
        print(x_test.shape)
        for i in range(0,40):
            y_p=model.predict(x_test)
            y_pred=np.append(y_pred, y_p)
            for j in range(19,2,-1):
                x_test[0][j]=x_test[0][j-1]
            # append the predicted value to y and get bollinger bands
            y1 = pd.concat([y1, pd.DataFrame(y_p, columns=["Close"])], ignore_index=True)

            rolling_mean=y1['Close'].rolling(window=20).mean()
            rolling_std=y1['Close'].rolling(window=20).std()
            x_test[0][0]=rolling_mean[rolling_mean.shape[0]-1]+2*rolling_std[rolling_std.shape[0]-1]
            x_test[0][1]=rolling_mean[rolling_mean.shape[0]-1]-2*rolling_std[rolling_std.shape[0]-1]

            x_test[0][2]=y_p[0]
        # y_pred=model.predict(x_test)
        plt.figure(figsize=(12, 6))
        plt.plot(y_test, label="True")
        plt.plot(y_pred, label="Predicted", color='red', linestyle='--')
        print(y_test.shape)
        print(y_pred.shape)
        # plot how much the model is off
        plt.plot(y_test-y_pred, label="Difference", color='green', linestyle='-.')
        # plt.plot(y_pred, label="Predicted")
        plt.legend()
        plt.show()
        # return y_pred
    
    
if __name__ == "__main__":
    # initiator()
    df=pd.read_csv('AAPL_data.csv')
    y_pred=linear_regression_on_stock(df)
    