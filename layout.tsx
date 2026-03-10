import React from 'react';

const Layout = ({ children }) => {
    return (
        <div>
            <header>
                <h1>ChadGPT Project</h1>
            </header>
            <main>{children}</main>
            <footer>
                <p>&copy; 2026 ChadGPT</p>
            </footer>
        </div>
    );
};

export default Layout;