import "./assets/css/Home.css";

const Home = () => {
    return (
        <main className="content-container">
            <header className="page-header">
                <h1>Get Started</h1>
            </header>

            <section className="welcome-section">
                <p>
                    Welcome to <strong>MSA</strong>, the Stock Data Analysis application for the Macedonian Stock Exchange.
                    This platform is developed as part of the Software Design and Architecture FCSE Skopje, aiming to provide
                    comprehensive tools for stock data analysis.
                </p>

                <aside className="disclaimer">
                    <div>
                        <strong>Important Notice:</strong>
                        <p>
                            The information and publications provided by this web application do not constitute financial advice,
                            investment advice, trading advice, or any other form of advice. All results are intended for informational
                            purposes only.
                        </p>
                        <p>
                            It is crucial to conduct your own analysis before making any investment decisions based on your personal
                            circumstances. If you require financial or general advice, we recommend consulting a qualified professional
                            in your jurisdiction.
                        </p>
                    </div>
                </aside>

            </section>

            <section className="app-overview">
                <article>
                    <p>
                        MSA efficiently scrapes raw data from the Macedonian Stock Exchange, reformats key aspects such as
                        filtering, validates the scraped data, and presents it in an easily accessible format for users.
                        It provides navigation using the following sections:</p>
                    <ul className="features-list">
                        <li>
                            <strong>Issuers List:</strong> View all issuers, their status, and the date of data
                            scraping.
                        </li>
                        <li>
                            <strong>Data Analyses:</strong> Calculate and visualize technical indicators (moving
                            averages and oscillators).
                        </li>
                        <li>
                            <strong>Data Reports:</strong> View detailed reports with buy, hold and sell signalization.
                        </li>
                        <li>
                            <strong>Personalization:</strong> Customize your experience with issuers watchlist and
                            custom page layouts.
                        </li>
                    </ul>
                </article>
            </section>
        </main>
    );
};

export default Home;