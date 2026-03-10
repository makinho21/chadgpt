import React, { ReactNode } from 'react';

const Layout = ({ children }: { children: ReactNode }) => {
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