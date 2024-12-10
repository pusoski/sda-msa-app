import React, { useEffect, useState } from "react";
import "./assets/css/main.css";
import "./assets/css/Issuers.css";

interface Issuer {
    symbol: string;
    is_bond: boolean;
    has_digit: boolean;
    valid: boolean;
    last_scraped_date: string;
}

type SortOrder = 'asc' | 'desc' | null;

const Issuers = () => {
    const [issuers, setIssuers] = useState<Issuer[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState<number | "All">(20);
    const [searchTerm, setSearchTerm] = useState<string>(""); // Search by symbol

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedSortOrder, setSelectedSortOrder] = useState<SortOrder>(null);
    const [selectedValidity, setSelectedValidity] = useState<string>("All");

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

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleApplyFilters = () => {
        setSortOrder(selectedSortOrder);
        setValidityFilter(selectedValidity);
        setCurrentPage(1);
        closeModal();
    };

    const [sortOrder, setSortOrder] = useState<SortOrder>(null);

    const [validityFilter, setValidityFilter] = useState<string>("All");

    const sortedIssuers = React.useMemo(() => {
        if (sortOrder === null) return issuers;
        const sorted = [...issuers].sort((a, b) => {
            if (a.symbol < b.symbol) return sortOrder === 'asc' ? -1 : 1;
            if (a.symbol > b.symbol) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [issuers, sortOrder]);

    const filteredIssuers = sortedIssuers.filter((issuer) => {
        const matchesSymbol = issuer.symbol.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesValidity =
            validityFilter === "All" ||
            (validityFilter === "Valid" && issuer.valid) ||
            (validityFilter === "Invalid" && !issuer.valid);
        return matchesSymbol && matchesValidity;
    });

    const totalPages = rowsPerPage === "All" ? 1 : Math.ceil(filteredIssuers.length / rowsPerPage);
    const startIndex = (currentPage - 1) * (rowsPerPage === "All" ? filteredIssuers.length : rowsPerPage);
    const currentIssuers =
        rowsPerPage === "All" ? filteredIssuers : filteredIssuers.slice(startIndex, startIndex + rowsPerPage);

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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const PaginationControls = () => {
        const totalRows = filteredIssuers.length;

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
        const endRow = Math.min(
            startIndex + (rowsPerPage === "All" ? filteredIssuers.length : rowsPerPage),
            totalRows
        );

        return (
            <div className="pagination">
                <div className="pagination-results">
                    <label htmlFor="rowsPerPage">Rows per page: </label>
                    <select
                        id="rowsPerPage"
                        className="rows-per-page-select"
                        value={rowsPerPage}
                        onChange={handleRowsPerPageChange}
                    >
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="All">All</option>
                    </select>
                    <span>
                        Displaying {startRow} – {endRow} of {totalRows} results
                    </span>
                </div>

                {rowsPerPage !== "All" && (
                    <div className="pagination-info">
                        <div className="pagination-buttons">
                            <button onClick={handleFirstPage} disabled={currentPage === 1}>
                                <span className="button-content">
                                    <img alt="Filter icon" className="button-icon" src="/first-page-icon.svg" />
                                    First
                                </span>
                            </button>
                            <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                                <span className="button-content">
                                    <img alt="Filter icon" className="button-icon" src="/chevron-left-icon.svg" />
                                    Previous
                                </span>
                            </button>
                            <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                                <span className="button-content">
                                    Next
                                    <img alt="Filter icon" className="button-icon" src="/chevron-right-icon.svg"/>
                                </span>
                            </button>
                            <button onClick={handleLastPage} disabled={currentPage === totalPages}>
                                <span className="button-content">
                                    Last
                                    <img alt="Filter icon" className="button-icon" src="/last-page-icon.svg" />
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="content-container">
            <div className="page-title">
                <div className="page-title-left">
                    <h1>Issuers List</h1>
                    <button onClick={handleScrapeIssuers}>
                        <span className="button-content">
                            <img alt="Load icon" className="button-icon" src="/load-icon.svg"/>
                            Load/Refresh List
                        </span>
                    </button>
                </div>
                <div className="page-title-right">
                    <input
                        type="text"
                        placeholder="Search by Issuer Symbol..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                    <button onClick={openModal} className="filter-sort-button">
                        <span className="button-content">
                            <img alt="Filter icon" className="button-icon" src="/filter-icon.svg" />
                            Sort & Filter
                        </span>
                    </button>
                </div>
            </div>

            <PaginationControls/>

            <table>
                <thead>
                <tr>
                    <th>Issuer Symbol</th>
                    <th>Validity Status</th>
                    <th>Last Scraping Date</th>
                    <th>View on MSE.mk</th>
                </tr>
                </thead>
                <tbody>
                {currentIssuers.map((issuer, index) => {
                    let tooltipContent =
                        'Issuer meets validity requirements: "Symbol cannot contain digits" and "Issuer cannot be classified as a Bond."';
                    if (!issuer.valid) {
                        const issues = [];
                        if (issuer.has_digit) issues.push('"Symbol cannot contain digits"');
                        if (issuer.is_bond) issues.push('"Issuer cannot be classified as a Bond"');
                        tooltipContent =
                            "Issuer does not meet validity requirements: " + issues.join(" and ") + ".";
                    }

                    return (
                        <tr key={index}>
                            <td>
                                <span>{issuer.symbol}</span>
                            </td>
                            <td>
                                    <span
                                        title={tooltipContent}
                                        className={issuer.valid ? "status-valid" : "status-invalid"}
                                    >
                                        {issuer.valid ? "Valid" : "Invalid"}
                                    </span>
                            </td>
                            <td>
                                <span>
                                    {issuer.last_scraped_date === "1/1/1995"
                                        ? "Data has not been scraped" : issuer.last_scraped_date}
                                </span>
                            </td>
                            <td className="view-issuer-td">
                                <a
                                    href={`https://www.mse.mk/en/symbol/${issuer.symbol}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View Issuer
                                    <img
                                        alt="New-tab icon"
                                        src="/new-tab-icon.svg"
                                        className="new-tab-icon"
                                    />
                                </a>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>

            <PaginationControls />

            {loading && (
                <div className="loading-overlay-back-drop">
                    <div className="loading-overlay-content">
                        <div className="loading-overlay-spinner-container">
                            <div className="loading-overlay-spinner"></div>
                        </div>
                        <div className="loading-overlay-text-container">Loading... This may take a while.</div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Sort & Filter Issuers</h2>
                        <div className="modal-section">
                            <h3>Sort by Issuer Symbol</h3>
                            <label>
                                <input
                                    type="radio"
                                    name="sortOrder"
                                    value="none"
                                    checked={selectedSortOrder === null}
                                    onChange={() => setSelectedSortOrder(null)}
                                />
                                Default
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="sortOrder"
                                    value="asc"
                                    checked={selectedSortOrder === 'asc'}
                                    onChange={() => setSelectedSortOrder('asc')}
                                />
                                Ascending
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="sortOrder"
                                    value="desc"
                                    checked={selectedSortOrder === 'desc'}
                                    onChange={() => setSelectedSortOrder('desc')}
                                />
                                Descending
                            </label>
                        </div>
                        <div className="modal-section">
                            <h3>Filter by Validity Status</h3>
                            <label>
                                <input
                                    type="radio"
                                    name="validityFilter"
                                    value="All"
                                    checked={selectedValidity === 'All'}
                                    onChange={(e) => setSelectedValidity(e.target.value)}
                                />
                                All
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="validityFilter"
                                    value="Valid"
                                    checked={selectedValidity === 'Valid'}
                                    onChange={(e) => setSelectedValidity(e.target.value)}
                                />
                                <span className="checkmark"></span>
                                Valid
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="validityFilter"
                                    value="Invalid"
                                    checked={selectedValidity === 'Invalid'}
                                    onChange={(e) => setSelectedValidity(e.target.value)}
                                />
                                Invalid
                            </label>
                        </div>
                        <div className="modal-actions">
                            <button onClick={handleApplyFilters} className="apply-button">
                                Apply
                            </button>
                            <button onClick={closeModal} className="cancel-button">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Issuers;