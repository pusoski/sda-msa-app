import React, { useState, useEffect } from "react";
import App from "./App";
import './assets/css/main.css';
import './assets/css/RootComponent.css';

const RootComponent: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState<string>("");

    useEffect(() => {
        const checkBackendStatus = () => {
            fetch("http://localhost:8000/app-status")
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => {
                    if (data.status === "ready") {
                        setLoading(false);
                    } else {
                        setLoading(true);
                    }
                    setDetails(data.details || "");
                })
                .catch((error) => {
                    console.error("Error checking backend status:", error);
                    setLoading(true);
                });
        };

        checkBackendStatus();

        const intervalId = setInterval(checkBackendStatus, 10000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (loading) {
            document.body.classList.add("no-scroll");
        } else {
            document.body.classList.remove("no-scroll");
        }

        return () => {
            document.body.classList.remove("no-scroll");
        };
    }, [loading]);

    return (
        <>
            {loading && (
                <div className="loading-overlay-back-drop">
                    <div className="loading-overlay-content">
                        <div className="loading-overlay-spinner-container">
                            <div className="loading-overlay-spinner"></div>
                        </div>
                        <div className="loading-overlay-text-container">
                            Initializing... This may take a few minutes.
                            <p className="details">{details || ""}</p>
                        </div>
                    </div>
                </div>
            )}
            <App />
        </>
    );
};

export default RootComponent;
