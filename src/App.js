//Created by: Byron Georgopoulos
//Created on: 31/07/2020
//Last Updated on: 17/08/2020
//Description: Using Geolocation API, OpenWeatherMap API, and Fetch API, this React App displays the weather at the user current location,
//and a user can search the OpenWeatherMap database for the weather in (most) cities across the globe. 

//Import React
import React, { Component } from 'react';

//Import Fetch API
import 'isomorphic-fetch';

//Styling and React-Bootstrap
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';

import ReactCountryFlag from 'react-country-flag';

//Get API key from .env file
//Note: Using a .env file to get the API Key always returns undefined due to this being a production build, but I left it in as a comment below.
//In theory, I would simply use the myKey variable below in the fetch URL.
//const myKey = process.env.REACT_APP_WEATHER_API_KEY;

const myKey = 'a948cabccbccc2096a74f9cd8e215cb7';

class App extends Component {
  
  constructor(props) {
    
    super(props);
    
    this.state = {
      error: null,
      isLoaded: false,
      userCity: '',
      cityInfo: [],
      showModal: false,
    };

  }

  //Use Geolocation API to find users co-ordinants
  getPos = () => {
    return new Promise (function (resolve, reject){
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  //Get Latitude & Longitude, and search OpenWeatherMap API based on location (coords)
  getLocalWeather = async (latitude, longitude) => {
    const apiCall = await fetch(`//api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${myKey}&units=metric`);
    const result = await apiCall.json();

    this.setState({ isLoaded: true });
    this.setState({ cityInfo: [result] });
  }

  //When Component Mounts
  componentDidMount() {

    this.getPos()
    .then((position) => {
      this.getLocalWeather(position.coords.latitude, position.coords.longitude)
    },
    (error) => {
      this.setState({
        isLoaded: true,
        error
      });
    })

  }

  //Handle user search
  handleCity = (event) => {
    let userCity = event.target.value;
    this.setState({ userCity: userCity });
  }

  //Search OpenWeatherMap API for user's city
  handleSubmit = () => {

    let userCity = this.state.userCity;
    this.refs.cityInput.value = '';

    fetch(`//api.openweathermap.org/data/2.5/weather?q=${userCity}&appid=${myKey}&units=metric`)
        .then(res => res.json())
        .then(
          (result) => {
            this.setState({
              isLoaded: true,
              cityInfo: [result],
            });
          },
          (error) => {
            this.setState({
              isLoaded: true,
              error
            });
          }
        )
    
  }

  //Opens Help Modal
  openModal = () => 
  {
    this.setState({ showModal: true });
  }

  //Closes Help Modal
  closeModal = () => 
  {
    this.setState({ showModal: false });
  }

  render() {

    const error = this.state.error;
    const isLoaded = this.state.isLoaded;
    const cityInfo = this.state.cityInfo;

    if (error)
    {
      return <div>
                Error: {error.message}
              </div>;
    }
    else
    if (!isLoaded)
    {
      return <div className='LoadingMsg'>
                
                <br></br>
                <h2>Welcome to Open Weather Map API</h2>
                <hr></hr>
                <h5>Finding your location...</h5>
                <h6>Please 'Allow Location Access' in your browser to continue...</h6>
                <hr></hr>
                <br></br>

            </div>;
    }
    else
    {
      return (
        <div className='App'>
  
          <br></br>
          <h2>Open Weather Map API : Find the weather in your city.</h2>
          <hr></hr>
          <h6>This was created by Byron Georgopoulos for <a href='https://www.hyperiondev.com/' target='_blank'>HyperionDev</a> (L02T14) using
               React Components. It uses the <a href='https://openweathermap.org/api' target='_blank'>Open Weather Map API</a> and 
               the <a href='https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API' target='_blank'>Geolocation API</a> to first find 
               your current location and display the weather in your city (if access is allowed by the user), and a search bar to find the weather
              for over 200.000 cities worldwide.</h6>
          <hr></hr>
          <br></br>

          <Container>
            <Row>
              <Col sm={5}>
                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <Form id='cityForm'>
                  <Form.Group>
                    <Form.Label>Please Enter A City:</Form.Label>
                    <Form.Control onChange={this.handleCity} type='text' placeholder='e.g. Johannesburg' ref='cityInput' />
                    <br></br>
                    <Container>
                      <Row>
                        <Col>
                          <Button onClick={this.handleSubmit} variant='primary'>Search City</Button>
                        </Col>
                        <Col>
                          <Button onClick={this.openModal} id='helpBtn' variant='info'>Help / FAQ</Button>
                        </Col>
                      </Row>
                    </Container>
                  </Form.Group>
                </Form>
              </Col>
              <Col sm={7}>
                    {cityInfo.map(item => (
                      <Card id='weatherCard'>
                        <Card.Body>
                          <Card.Title><h3>Weather for <b>{item.name}</b>, {item.sys.country} .</h3></Card.Title>
                          
                          
                          <Container>
                            <Row>
                              <Col>
                                <img id='weatherIcon' src={`http://openweathermap.org/img/w/${item.weather[0].icon}.png`}></img>
                              </Col>
                              <Col>
                                <ReactCountryFlag id='flagIcon' countryCode={item.sys.country} svg/>
                              </Col>
                            </Row>
                          </Container>
                          <hr></hr>
                          <Card.Text><h5>It is currently: ±{Math.round(item.main.temp)}° C.</h5></Card.Text>
                          <Card.Text><h5>It feels like: ±{Math.round(item.main.feels_like)}° C.</h5></Card.Text>
                          <Card.Text><h5>The weather is: {item.weather[0].main} ({item.weather[0].description}).</h5></Card.Text>
                          <Card.Text><h5>Humidity is at: {item.main.humidity}%.</h5></Card.Text>
                          <Card.Text><h5>Wind Speed is at: {item.wind.speed}m/s.</h5></Card.Text>
                        </Card.Body>
                      </Card>
                    ))}
              </Col>
            </Row>
          </Container>
          <br></br>
          <hr></hr>
          <br></br>
          
          <Modal id='helpModal' show={this.state.showModal} onHide={this.closeModal} animation={true} centered>
            <Modal.Body>
              <h4 id='modalHeading'>Help : Searching For A City</h4>
              <hr></hr>
              <Container>
                <Row>
                  <Col sm={1}>
                    <h6>1. </h6>
                  </Col>
                  <Col sm={11}>
                    <h6>You can only search cities in the input field. No countries, co-ordinates, provinces, states, etc.</h6>
                  </Col>
                </Row>
                <Row>
                  <Col sm={1}>
                    <h6>2. </h6>
                  </Col>
                  <Col sm={11}>
                    <h6>You can only search a cities FULL NAME. For example, LA ≠ Los Angeles, or JHB ≠ Johannesburg.</h6>
                  </Col>
                </Row>
                <Row>
                  <Col sm={1}>
                    <h6>3. </h6>
                  </Col>
                  <Col sm={11}>
                    <h6>That being said, searching for a city is NOT case sensitive. For example, los angeles = Los Angeles, or johannesburg = Johannesburg.</h6>
                  </Col>
                </Row>
                <Row>
                  <Col sm={1}>
                    <h6>4. </h6>
                  </Col>
                  <Col sm={11}>
                    <h6>± : Temperatures are rounded to the nearest whole number.</h6>
                  </Col>
                </Row>
                <Row>
                  <Col sm={1}>
                    <h6>5. </h6>
                  </Col>
                  <Col sm={11}>
                    <h6>Temperatures are in Degrees Celcius.</h6>
                  </Col>
                </Row>
              </Container>
            </Modal.Body>
            <Modal.Footer>
              <Button variant='danger' onClick={this.closeModal}>Close</Button>
            </Modal.Footer>
          </Modal> 

        </div>
      );
    }
  }
}

export default App;