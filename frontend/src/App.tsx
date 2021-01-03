import React, {useEffect, useState} from 'react';
import './App.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Carousel} from 'react-bootstrap';

function App() {
  const [allPhotos, setAllphotos] = useState([]);
  async function fetchPhotos(){
    const { data } = await axios.get(`${baseUri}getAllPhotos`);
    console.log(data);
    setAllphotos(data);
  }
  useEffect(() => {
    fetchPhotos();
  }, [])
  const  baseUri: string = process.env.REACT_APP_API_URL!;
  console.log(baseUri);

  function getCarouselImage(photo: any){
    return <Carousel.Item interval={1000}>
      <img src ={photo.url} alt={photo.filename} />
      <Carousel.Caption>
        <h3>{photo.filename}</h3>
      </Carousel.Caption>
    </Carousel.Item>
  }

  return (
    <div className="App bg-secondary min-vh-100">
      <Carousel>
        {allPhotos.map(photo => getCarouselImage(photo))}
      </Carousel>
    </div>
  );
}

export default App;
