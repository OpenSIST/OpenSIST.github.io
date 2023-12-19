import './App.css';

function TopBar(props) {
    return (
        <div className="Center-block">
            <header className="TopBar-header">
                <h1> Welcome to OpenSIST</h1>
                {props.example}
            </header>
        </div>
    );
}

export default TopBar

