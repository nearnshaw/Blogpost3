import * as DCL from 'metaverse-api'
import { Vector3Component } from 'metaverse-api';
const axios = require('axios');



const appId : string = "bb6063b3"
const APIkey : string = "2e55a43d3e62d76f145f28aa7e3990e9"
const lat : string = "-34.55"
const lon: string = "-58.46"


let objectCounter: number = 0

const callUrl : string = "http://api.weatherunlocked.com/api/current/" + lat + ",%20" + lon + "?app_id=" + appId + "&app_key=" + APIkey

export enum Weather {
  sun,
  clouds,
  rain,
  heavyRain,
  snow,
  storm
}

export type Drops = {
  [key: string]: Vector3Component
}

// This is an interface, you can use it to enforce the types of your state
export interface IState {
 weather: Weather
 drops: Drops
}

export default class HouseScene extends DCL.ScriptableScene<any, IState> {
  // This is your initial state and it respects the given IState interface
  state = {
    weather: Weather.sun,
    drops: {"a": {x:2, y:2, z:2}} as any,
  }

  sceneDidMount() {
    setInterval(
      this.getWeather()
    , 1000000)
  }

  getWeather() { 
      axios.get(callUrl)
      .then( (response:any) => {
        console.log(response.data.wx_desc)
        let weth = "rain"
        this.mapWeather(weth)
        //this.mapWeather(response.data.wx_desc)
        
      })
      .catch( (error:any) => {
        console.log(error)
      })    
  }

  mapWeather(weather: string){
  
    let simpleWeather: Weather
    if ( weather.match(/(thunder)/gi) ){
      simpleWeather = Weather.storm;
      this.startRain(15)
    } else if (weather.match(/(snow|ice)/gi) ){
      simpleWeather = Weather.snow
    } else if (weather.match(/(heavy|torrential)/gi) ){
      simpleWeather = Weather.heavyRain
      this.startRain(50)
    } else if (weather.match(/(rain|drizzle|shower)/gi) ){
      simpleWeather = Weather.rain
      this.startRain(15)
    } else if (weather.match(/(cloud|overcast|fog|mist)/gi) ){
      simpleWeather = Weather.clouds
    } else {
      simpleWeather = Weather.sun
    }
    this.setState({weather: simpleWeather })
  
    console.log(weather)
    console.log(this.state.weather)  
  }

  startRain(dropsToAdd: number){
   let dropsAdded: Drops = {}
    // while (dropsAdded.length < dropsToAdd)
    // {
    //   dropsAdded.push( {
    //     x: (Math.random() *10 ),
    //     y:  10,
    //     z: (Math.random() *10 ) 
    //    } )
    // }
    this.setState({drops: this.addDrop() })

    
  }

  addDrop(){
    let dropsAdded: Drops = {}
    let newDrop: Vector3Component = {
      x: (Math.random() *10 ),
      y:  1,
      z: (Math.random() *10 ) 
     } 
     dropsAdded["drop"  + objectCounter++ ] = newDrop
    //this.setState({drops: [...this.state.drops, newDrop] })
    //while (this.state.weather == Weather.rain){
    return dropsAdded

  }
  

  renderWeather(){
    switch(this.state.weather){
      case Weather.sun:
        return
      case Weather.clouds:
        return this.renderClouds()
      case Weather.rain:
        return this.renderDrops()
      case Weather.heavyRain:  
        return this.renderDrops()
      case Weather.snow:
        return
      case Weather.storm:
        return this.renderDrops()
    }

  }

  renderClouds(){
    return <gltf-model 
    src = "models/clouds/clouds.gltf"
    position={{ x:4, y:3, z:-4}}
    scale={3}
    />
  }

  renderDrops()
  {
    for (var drop in this.state.drops){
      console.log(
      <gltf-model
        src="models/raindrop.gltf"
        position= {this.state.drops[drop]}
        key= {drop}
        transition={{
          position: { duration: 500}
        }}
      />)
    }
    // for (var droplet in this.state.drops){
    //   <gltf-model
    //     src="models/raindrop.gltf"
    //     position= {this.state.drops[drop]}
    //     key= {drop}
    //     transition={{
    //       position: { duration: 500}
    //     }}
    //   />
    // }
    //  this.state.drops.map( (dropPos, dropNum) =>
    //   <gltf-model
    //     src="models/raindrop.gltf"
    //     position={{dropPos[dropNum]}}
    //     key= {"drop" + dropNum}
    //     transition={{
    //       position: { duration: 500}
    //     }}
    //   />
    // )
  }
  

  async render() {
    return (
      <scene position={{ x: 5, y: 0, z: 5 }}>
        {this.renderWeather()}
      </scene>
      
    )
  }
}
//http://api.weatherunlocked.com/api/current/-34.55,%20-58.46?app_id=bb6063b3&app_key=2e55a43d3e62d76f145f28aa7e3990e9
