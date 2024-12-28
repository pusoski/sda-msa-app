import "./assets/css/Home.css"
const Home = () => {
    return (
        <div className="content-container">
            <div className="page-title-left">
                <h1> Get Started</h1>
            </div>
            <div className='page-content'>
                <p>
                    Welcome to the SDA-MSA, or Stock data analysis app for the Macedonian stock exchange.
                    This is the starting page of a architecture and software design course from FINKI.
                </p>
                <hr id="break"/>
                <p>
                    <i>Note ! <br/> </i>
                    <u>The information and publications of this web application do not constitute financial advice</u>,
                    investment advice, trading advice or any other form of advice.
                    All results from the web application are intended for information purposes only.
                    <br/>
                    <br/>
                    It is very important to do your own analysis before making any investment based on your own personal
                    circumstances.<br/>
                    If you need financial advice or further advice in general, it is recommended that you identify a
                    relevantly qualified individual in your jurisdiction who can advise you accordingly.
                    <hr id="break"/>
                </p>
                <p>
                    This app scrapes raw data from the Macedonian stock exchange, after reformatting certain aspects
                    about the data, such as filtering out un-wanted issuers and symbols,
                    it checks if the scraped data is valid, and provides easy visibility to you, the end user.
                    <br/>

                    <ul> From here you may navigate to the:
                        <li>Issuers List, to view all issuers, their state and date of scrape. </li>
                        <li>The Data Analyses tab, that displays selected issuer, current, live and historical data.
                        </li>
                        <li>Personalization tab, where we you can choose various preferences such as hide certain
                            issuers, data display and chart types
                        </li>
                        <li>And the Data Reports Tab where you can view detailed generated reports from the scraped
                            data
                        </li>
                    </ul>

                    <ul>This application was built by:
                        <li>Hristijan Pusovski</li>
                        <li>Iskra Stojcevksa</li>
                        <li>Irinej Ilievksi</li>
                    </ul>
                </p>
            </div>
        </div>
    );
};

export default Home;