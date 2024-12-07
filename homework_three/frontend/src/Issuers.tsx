import React, {useEffect, useState} from "react";
import "./index.css";
import "./Issuers.css";

interface Issuer {
    symbol: string;
    is_bond: boolean;
    has_digit: boolean;
    valid: boolean;
}

const Issuers = () => {
    const [issuers, setIssuers] = useState<Issuer[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState<number | "All">(20);

    useEffect(() => {
        if (loading) {
            document.body.classList.add("no-scroll");
        } else {
            document.body.classList.remove("no-scroll");
        }
        return () => document.body.classList.remove("no-scroll");
    }, [loading]);

    const handleScrapeIssuers = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8000/scrape-issuers", {
                method: "POST",
            });
            await response.json();
            await fetchIssuers();
        } catch (error) {
            console.error("Failed to scrape issuers:", error);
        }
        setLoading(false);
    };

    const fetchIssuers = async () => {
        try {
            const response = await fetch("http://localhost:8000/issuers");
            const data = await response.json();
            setIssuers(data);
        } catch (error) {
            console.error("Failed to fetch issuers:", error);
        }
    };

    useEffect(() => {
        fetchIssuers();
    }, []);

    const totalPages = rowsPerPage === "All" ? 1 : Math.ceil(issuers.length / rowsPerPage);
    const startIndex = (currentPage - 1) * (rowsPerPage === "All" ? issuers.length : rowsPerPage);
    const currentIssuers =
        rowsPerPage === "All" ? issuers : issuers.slice(startIndex, startIndex + rowsPerPage);

    // Pagination Handlers
    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleFirstPage = () => {
        if (currentPage !== 1) setCurrentPage(1);
    };

    const handleLastPage = () => {
        if (currentPage !== totalPages) setCurrentPage(totalPages);
    };

    const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value === "All" ? "All" : Number(e.target.value);
        setRowsPerPage(value);
        setCurrentPage(1);
    };

    // Reusable Pagination Component
    const PaginationControls = () => {
        const totalRows = issuers.length;

        if (totalRows === 0) {
            return (
                <div className="pagination">
                    <div className="pagination-info">
                        <span>No records found.</span>
                    </div>
                </div>
            );
        }

        const startRow = startIndex + 1;
        const endRow = Math.min(startIndex + (rowsPerPage === "All" ? issuers.length : rowsPerPage), totalRows);

        return (
            <div className="pagination">
                <div>
                    <label htmlFor="rowsPerPage">Rows per page: </label>
                    <select id="rowsPerPage" value={rowsPerPage} onChange={handleRowsPerPageChange}>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="All">All</option>
                    </select>
                </div>

                {rowsPerPage !== "All" && (
                    <div className="pagination-info">
                    <span>
                        Displaying: {startRow} – {endRow} of {totalRows} records
                    </span>
                        <div className="pagination-buttons">
                            <button onClick={handleFirstPage} disabled={currentPage === 1}>
                                First
                            </button>
                            <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                                Previous
                            </button>
                            <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                                Next
                            </button>
                            <button onClick={handleLastPage} disabled={currentPage === totalPages}>
                                Last
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };


    return (
        <div className="issuers-container">
            <h1>Issuers</h1>
            <button onClick={handleScrapeIssuers}>Load/Refresh Issuers List</button>

            {/* Pagination Above the Table */}
            <PaginationControls/>

            <table>
                <thead>
                <tr>
                    <th>Symbol</th>
                    <th>Validity</th>
                    <th>Link to MSE</th>
                </tr>
                </thead>
                <tbody>
                {currentIssuers.map((issuer, index) => {
                    let tooltipContent = "Issuer meets validity requirements: \"Symbol cannot contain digits\"" +
                        " and \"Issuer cannot be classified as a Bond.\"";
                    if (!issuer.valid) {
                        const issues = [];
                        if (issuer.has_digit) issues.push("\"Symbol cannot contain digits");
                        if (issuer.is_bond) issues.push("\"Issuer cannot be classified as a Bond");
                        tooltipContent = "Issuer does not meet validity requirements: " + issues.join(" and ") + ".\"";
                    }

                    return (
                        <tr key={index}>
                            <td>
                                <span>{issuer.symbol}</span>
                            </td>
                            <td
                                title={tooltipContent}
                                className={issuer.valid ? "status-valid" : "status-invalid"}
                            >
                                {issuer.valid ? "Valid" : "Invalid"}
                            </td>
                            <td>
                                <a
                                    href={`https://www.mse.mk/en/symbol/${issuer.symbol}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View Issuer
                                    <img
                                        alt="external link icon"
                                        src="/external-link.svg"
                                        className="external-link-icon"
                                    />
                                </a>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>

            {/* Pagination Below the Table */}
            <PaginationControls/>

            {/* Loading Overlay */}
            {loading && (
                <div className="loading-overlay-backdrop">
                    <div className="loading-overlay-content">
                        <div className="loading-overlay-spinner-container">
                            <div className="loading-overlay-spinner"></div>
                        </div>
                        <div className="loading-overlay-text-container">Loading... This may take a while.</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Issuers;