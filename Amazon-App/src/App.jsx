import React, { useEffect, useState, useCallback, useMemo } from 'react';
import './App.css';

function debounce(callback, delay) {
    let timer;
    return (value) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        callback(value);
      }, delay, []);
    };
  }

function App() {

const [products, setProducts] = useState ([]);
const [query, setQuery] = useState('');
const [suggestions, setSuggestions] = useState([]);

useEffect(() => {
  fetch(`http://localhost:3333/products`)
  .then(res => res.json())
  .then(data => {
    setProducts(data);
  })
  .catch(err => console.error("Errore nel recupero dei dati dal fetch:", err));
}, [])

useEffect(() => {

if (query === '') {
      setSuggestions([]);
      return;
    }

  fetch(`http://localhost:3333/products?search=${query}`)
  .then(res => res.json())
  .then(data => {
    setSuggestions(data);
  })
  .catch(err => console.error("Errore nel recupero dei dati per suggerimeto", err));
}, [query])

const handleSearch = useCallback(
    debounce((value) => {
      setQuery(value.toLowerCase().trim());
    }, 200), []);

const filteredProduct = useMemo(() => {
  return products.filter(product => 
    product.name.toLowerCase().includes(query.toLowerCase().trim()) || 
    product.description.toLowerCase().includes(query.toLowerCase().trim())
  );
}, [products, query]);

return(
  <div className="GenericContainer">
    <div className="searchContainer">
      <input type="text" placeholder="Cerca un prodotto..." value={query} onChange={(e) => handleSearch(e.target.value)}/>
      
      {suggestions.length > 0 && (
        <ul className="suggestionsList">
          {suggestions.map((suggestion) => (
            <li key={suggestion.id} onClick={() => {
              setQuery(suggestion.name.toLowerCase().trim());
              setSuggestions([]);
            }}>
              {suggestion.name}
            </li>
          ))}
        </ul>
      )}
    </div>

    <div className="productsContainer" >
    {filteredProduct.map((product) => {
      return (
        <div className="productCard" key={product.id}>
          <img
            src={`https://via.placeholder.com/500x500?text=${encodeURIComponent(product.name)}`}
            alt={product.name}
          />
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <span>{product.price} €</span>
        </div>
      )
    })}
    </div>

    <div className="suggestionsContainer">

      

      <div className="suggestionsMessage">
        {filteredProduct.map((product) => (
          <div className="productCard" key={product.id}>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <span>{product.price} €</span>
          </div>
        ))}
      </div>

    </div>

  </div>
)

}

export default App;