import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
document.title = "HOMERUN";

const changeFavicon = (iconURL) => {
  const link = document.querySelector("link[rel~='icon']");
  if (link) {
    link.href = iconURL;
  } else {
    const newLink = document.createElement("link");
    newLink.rel = "icon";
    newLink.href = iconURL;
    document.head.appendChild(newLink);
  }
};

changeFavicon("/icon.png");

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);