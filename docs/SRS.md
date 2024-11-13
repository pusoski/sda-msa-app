# Software Requirements Specification

## Description:
The “Macedonian Stock Analyzer” is a comprehensive financial analysis tool designed to empower investors, analysts, and financial enthusiasts with insights into the “Macedonian Stock Exchange” (MSE). This application allows the users to access, analyze, and visualize historical market data for all listed companies over the last decade. It focuses on delivering a user-friendly, data-driven platform for informed investment decision-making. 
	The application offers a comprehensive platform for investors, analysts, and students to explore and analyze stock data. By offering tools tailored for in-dept stock analysis and trend forecasting, it serves both beginners and seasoned investors seeking to make data-driven decisions in a rapidly evolving market. 
	Macedonian Stock Analyzer offers a variety of key features and functionalities amongst which are: real-time and historical data, providing the users real time updates on current stock prices, technical analysis tools, such as volume analysis, moving averages, allowing users to identify potential buy and sell signals, understand momentum and recognize patterns, data visualization and news and market sentiment analysis, which provide users with insights into how current events might impact the stock prices of Macedonian companies. 
	The app’s simple and intuitive design ensures that users can navigate through it effortlessly through stock charts, technical indicators and reports. It positions itself as an essential tool for anyone looking to navigate the MSE with confidence, using technology to bridge the gap between raw data and actionable insights.  

___

## 1. Functional Requirements:

### 1.1. Data Retrieval and Processing:

	FR1: The application shall retrieve daily historical stock data for all listed companies on the Macedonian Stock Exchange. 
	FR2: The data shall cover a minimum period of 1 year. 
 	FR3: The data shall cover a maximum period of 10 years.
	FR4: The data shall include information for each trading day.
 		FR4.1: The data shall include average trade price for each trading day.
   		FR4.2: The data shall include volume for each trading day.
     		FR4.3: The data shall include turnover in BEST in denars for each trading day.
       		FR4.4: The data shall include total turnover in denars for each trading day.

### 1.2. Data Visualization:

	FR4: The application shall display data in chart format (e.g., line charts, bar charts) to visualize stock performance trends over time. 
	FR5: Users shall be able to select specific companies and time ranges for customized data views. 
	FR6: The application shall support comparison of multiple companies' stock performance within the same chart. 

### 1.3. Analytical Tools:

	FR7: Users shall be able to generate reports on the performance of selected stocks. 
	FR8: Users shall be able to download data and charts in various formats (e.g., CSV, PNG).
	FR9: The application shall include basic technical indicators such as moving averages, RSI (Relative Strength Index), and MACD (Moving Average Convergence Divergence). 

### 1.4. User Authentication and Profiles:

	FR10: Users shall be able to create accounts. 
	FR11: Users shall be able to save their analysis preferences. 
	FR12: The application shall allow users to set up personalized watchlists for companies of interest. 

___

## 2. Non-Functional Requirements:

### 2.1. Performance:
```
NFR1: The application shall load stock data and charts within 20 seconds for queries involving up to 3 years of data. 
NFR2: The application should handle concurrent users efficiently and be scalable to accommodate at least 150 simultaneous users. 
   ```

### 2.2 Security:
```
NFR3: All user data, including preferences and watchlists, shall be encrypted.
NFR4: The application shall comply with GDPR regulations to protect user privacy.
```
### 2.3. Availability:

    NFR5: The application shall be available with 99.9% uptime.
    NFR6: A mobile-responsive interface is required for use on smartphones and tablets. 
    
### 2.4. Usability:
    
```
NFR7: The interface shall be user-friendly, with intuitive navigation for non-technical users. 
NFR8: Documentation and tutorials shall be available within the app to help users understand the features.
```
### 2.5. Maintainability:
```
NFR9: The application shall have modular code for easy maintenance and updating. 
NFR10: Regular data backups shall be maintained to ensure data recovery in case of failure. 
 ```

___

## 3. User Personas.User Scenarios:

### 3.1.User Personas:

#### 3.1.1. Investor:
```
- Profile: Bobi is a 54-year-old retail investor with moderate knowledge of stock analysis.
- Goals: Bobi wants to identify trends in Macedonian stocks to make long-term investments.
- Problem: Bobi finds it hard to interpret raw stock data and would benefit from visual tools.
```
#### 3.1.2. Analyst:
```
- Profile: Ana is a 30-year-old financial analyst at a Macedonian investment firm.
- Goals: Ana needs access to historical stock data and technical indicators to generate reports for her clients.
- Problem: Ana requires a tool that saves her analysis preferences and allows her to download data efficiently.
```
#### 3.1.2. Student:
```
- Profile: Stefan is a 22-year-old economics student interested in learning about stock analysis.

- Goals: Stefan wants to explore stock trends and learn about technical indicators in a simple and intuitive way.
- Pain Points: Stefan needs tutorials and documentation within the application to understand its features.
```

### 3.2. User Scenarios:
#### 3.2.1. Investor:
````
Scenario 1: Bobi Analyzes a Specific Stock Trend 

- Goal: Bobi wants to analyze the trend of a specific stock over the past 5 years. 

- Steps: 

	1. Bobi logs in to the Macedonian Stock Analyzer. 

	2. He selects the company and sets the time range to 5 years. 

	3. Bobi applies a moving average indicator to understand long-term trends. 

	4. He saves the chart to his profile and downloads the data in CSV format. 

- Outcome: Bobi gains insights into the stock’s performance and saves data for offline review. 
````
#### 3.2.2. Analyst:
```
Scenario 2: Ana Creates a comparative report for multiple stocks 

- Goal: Ana wants to compare the performance of three financial institutions over the past year. 

- Steps: 

	1. Ana logs in and selects the three companies from her watchlist. 

	2. She sets the time range to 1 year and chooses to display all three stocks on a single line chart. 

	3. Ana downloads the data and exports the chart for a client report. 

- Outcome: Ana successfully prepares a comparative report for her client.
```
#### 3.2.3. Student:
```
Scenario 3: Stefan Learns About Stock Analysis Using In-App Tutorials 

- Goal: Stefan wants to understand how to use technical indicators. 

- Steps: 

	1. Stefan logs in and navigates to the tutorials section. 

	2. He finds a tutorial on how to use the RSI and MACD indicators. 

	3. Stefan applies these indicators to a stock to see them in action. 

- Outcome: Stefan gains a better understanding of stock analysis techniques. 
```
