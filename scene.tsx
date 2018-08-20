import * as DCL from 'metaverse-api'
import { Vector3Component } from 'metaverse-api';
const axios = require('axios');

let fakeWeather: string | null = "light rain"


const appId : string = "bb6063b3"
const APIkey : string = "2e55a43d3e62d76f145f28aa7e3990e9"
const lat : string = "-34.55"
const lon: string = "-58.46"


let objectCounter: number = 0
const dropSpeed: number = 3000
const flakeSpeed: number = dropSpeed*4
let precipitationLoop: any = null

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

export type Flakes = {
  [key: string]: [Vector3Component, Vector3Component]
} 

// This is an interface, you can use it to enforce the types of your state
export interface IState {
 weather: Weather
 drops: Drops
 flakes: Flakes
}

export default class HouseScene extends DCL.ScriptableScene<any, IState> {
  // This is your initial state and it respects the given IState interface
  state = {
    weather: Weather.sun,
    drops: {} as any,       ////   WHYYYY the as any?????    implicitly of type any
    flakes: {} as any,
  }

  sceneDidMount() {
    setInterval(
      this.getWeather()
    , 10000)
  }

  getWeather() { 
    console.log("getting new weather")
    axios.get(callUrl)
      .then( (response:any) => {
        console.log(response.data.wx_desc)
        let weather: Weather
        if (fakeWeather){
          weather = this.mapWeather(fakeWeather)
          fakeWeather = null
        }
        else{
          weather = this.mapWeather(response.data.wx_desc)
        }
        if (weather == this.state.weather) {return}
        clearInterval(precipitationLoop)
        this.setState({weather: weather })
        if (weather == (Weather.sun | Weather.clouds)) {return}
        this.startPrecipitation()
 
      })
      .catch( (error:any) => {
        console.log(error)
      })    
  }

  mapWeather(weather: string){
    let simpleWeather: Weather
    if ( weather.match(/(thunder)/gi) ){       //// can we do this neater w/out so many ifs?
      simpleWeather = Weather.storm;
    } else if (weather.match(/(snow|ice)/gi) ){
      simpleWeather = Weather.snow
    } else if (weather.match(/(heavy|torrential)/gi) ){
      simpleWeather = Weather.heavyRain 
    } else if (weather.match(/(rain|drizzle|shower)/gi) ){
      simpleWeather = Weather.rain
    } else if (weather.match(/(cloud|overcast|fog|mist)/gi) ){
      simpleWeather = Weather.clouds
    } else {
      simpleWeather = Weather.sun
    }
    console.log("literal weather: " + weather)
    console.log("simple weather: " + simpleWeather)  
    return simpleWeather
  }

  startPrecipitation(){
    switch(this.state.weather){
      case Weather.storm:
        this.startRain(100)
        break
      case Weather.snow:
        this.startSnow(500)
        break 
      case Weather.heavyRain:
        this.startRain(50)
        break
      case Weather.rain:
        this.startRain(500)
        break
    }
  }

  startRain(interval: number){
    precipitationLoop = setInterval( f =>{
      this.addDrop()
      }, interval)
  }

  startSnow(interval: number){
    precipitationLoop = setInterval( f =>{
      this.addFlake()
      }, interval)  
  }

  async addDrop(){
    let newDrop: Vector3Component = {
      x: (Math.random() *10 ),
      y:  9,
      z: (Math.random() *10 ) 
     } 
    const dropName = "drop"  + objectCounter++
    let dropsAdded: Drops = Object.create(this.state.drops)
    dropsAdded[dropName] = newDrop
    this.setState({drops: dropsAdded })
    setTimeout(f => {
      dropsAdded = Object.create(this.state.drops)
      dropsAdded[dropName].y = -1
      this.setState({drops: dropsAdded })
      },10)
    setTimeout(f => {
      dropsAdded = Object.create(this.state.drops)
      delete dropsAdded.dropName    
      this.setState({drops: dropsAdded })
      //console.log("deleted" + dropName )
      }, dropSpeed)
  }

  async addFlake(){
    let newFlakePos: Vector3Component = {
      x: (Math.random() *10 ),
      y:  9,
      z: (Math.random() *10 ) 
     } 
    let newFlakeRot: Vector3Component = {
      x: (Math.random() *360 ),
      y: (Math.random() *360 ),
      z: (Math.random() *360 ) 
     } 
    const flakeName = "flake"  + objectCounter++
    let flakesAdded: Flakes = Object.create(this.state.flakes)
    flakesAdded[flakeName] = [newFlakePos, newFlakeRot]   //pos and rotation
    this.setState({flakes: flakesAdded })
    setTimeout(f => {
      let flakesAdded = Object.create(this.state.flakes)
      flakesAdded[flakeName][0].y = -1
      flakesAdded[flakeName][1] = {
        x: (Math.random() *360 ),
        y: (Math.random() *360 ),
        z: (Math.random() *360 ) 
       }  
      this.setState({flakes: flakesAdded })
      },10)
    setTimeout(f => {
      flakesAdded = Object.create(this.state.flakes)
      delete flakesAdded.flakeName    
      this.setState({flakes: flakesAdded })
      //console.log("deleted" + flakeName )
      }, flakeSpeed)

  }
  renderWeather(){
    switch(this.state.weather){
      case Weather.sun:
        return
      case Weather.clouds:
        return this.renderClouds("white")
      case Weather.rain:
        return (
          <entity>
             {this.renderClouds("white")}
             {this.renderDrops()}
          </entity>
          ) 
      case Weather.heavyRain:  
        return (
          <entity>
             {this.renderClouds("dark")}
             {this.renderDrops()}
          </entity>
          ) 
      case Weather.snow:
      return (
        <entity>
           {this.renderClouds("dark")}
           {this.renderFlakes()}
        </entity>
        ) 
      case Weather.storm:
        return (
          <entity>
             {this.renderClouds("dark")}
             {this.renderDrops()}
             {this.renderLightNing()}
          </entity>
          ) 
    }

  }

  renderClouds(cloudType:string){
    switch (cloudType)
    {
      case "dark":  
        return (
          <gltf-model 
          src = {"models/dark-cloud.gltf"}
          position={{ x:5, y:8, z:5}}
          scale={4}
          />
        )
      case "white":
        return <gltf-model 
        src = {"models/clouds/clouds.gltf"}
        position={{ x:9, y:4, z:1}}
        scale={3}
        />
    }   
  }

  renderDrops()
  {
    let dropModels: any[] = []
    for (var drop in this.state.drops){
      //console.log("rendering drop " + drop)
      dropModels.push(
      <gltf-model
        src="models/raindrop.gltf"
        position= {this.state.drops[drop]}
        key= {drop}
        scale={2}
        transition={{
          position: { duration: dropSpeed, timing:"linear"}
        }}
      />)
    }
    return dropModels
  }
  
  renderFlakes()
  {
    let flakeModels: any[] = []
    for (var flake in this.state.flakes){
      //console.log("rendering drop " + drop)
      flakeModels.push(
      <gltf-model
        src="models/flake.gltf"
        position= {this.state.flakes[flake][0]}
        rotation={this.state.flakes[flake][1]}
        key= {flake}
        scale={1}
        transition={{
          position: { duration: flakeSpeed, timing:"linear"},
          rotation: { duration: flakeSpeed, timing:"linear"}
        }}
      />)
    }
    return flakeModels
  }

  renderLightNing(){
    let lightningNum:number = Math.floor(Math.random()*25) + 1
    if (lightningNum>6) {return}
    return (
      <gltf-model 
        src = {"models/ln" + lightningNum + ".gltf"}
        position={{ x:5, y:8, z:5}}
        scale={4}
        />
      )     
  }

  async render() {
    return (
      <scene>
        {this.renderWeather()}
        <gltf-model
          src="models/House.gltf"
          scale={0.04}
          position={{x:0, y:0, z:5}}
        />
        <plane 
          scale={9.9}
          rotation={{x:90, y:0, z:0}}
          position={{x:5, y:0, z:5}}
          color="#3e543e"
        />
      </scene>
      
    )
  }
}
//http://api.weatherunlocked.com/api/current/-34.55,%20-58.46?app_id=bb6063b3&app_key=2e55a43d3e62d76f145f28aa7e3990e9
