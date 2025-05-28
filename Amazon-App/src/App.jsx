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
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState ('');
  const [suggestions, setSuggestions] = useState([]);

useEffect(() => {
  fetch(`http://localhost:3333/products`)
  .then(res => res.json())
  .then(data => {
    setProducts(data);
  })
  .catch(err => console.error(err));
}, []);

const handleSearch = useCallback(
    debounce((value) => {
      setQuery(value.toLowerCase().trim());
    }, 200), []);

useEffect(() => {
  if (query.leght === '') {
    setSuggestions([]);
    return;
  }

  fetch(`http://localhost:3333/products?search=${query}`)
    .then(res => res.json())
    .then(data => {
      setSuggestions(data);
    })
    .catch(err => {
      console.error('Errore nella ricerca suggerimenti:', err);
      setSuggestions([]);
    });
}, [query]);
const filteredProducts = useMemo(() => {
  return products.filter((product => {
    return product.name.toLowerCase().includes(query) ||
    product.description.toLowerCase().includes(query)
  }))
}, [products, query]);

return (
  <div>
    <h1>Lista prodotti amazon</h1>
    <input 
    type="text" 
    value={query}
    onChange={(e) => handleSearch(e.target.value)}
    />

{query && suggestions.length > 0 && (
  <ul className="suggestions-dropdown">
    {suggestions.map((item) => (
      <li
        key={item.id}
        onMouseDown={() => {
          setQuery(item.name);
          setSuggestions([]);
        }}
      >
        {item.name}
      </li>
    ))}
  </ul>
)}


    {filteredProducts.map((product) => (
      <div key={product.id}>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <p>Prezzo: {product.price}€</p>
      </div>
    ))}
  </div>
)
  
}
export default App;