import * as DCL from 'metaverse-api'
import { Vector3Component } from 'metaverse-api';
const axios = require('axios');

const fakeWeather: string = "storm thunder"

const appId : string = "bb6063b3"
const APIkey : string = "2e55a43d3e62d76f145f28aa7e3990e9"
const lat : string = "-34.55"
const lon: string = "-58.46"


let objectCounter: number = 0
//let lightningNum: number = 0
const dropSpeed: number = 3000
const flakeSpeed: number = dropSpeed*4

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
    , 1000000)
  }

  getWeather() { 
      axios.get(callUrl)
      .then( (response:any) => {
        console.log(response.data.wx_desc)
        if (fakeWeather){
          this.mapWeather(fakeWeather)}
        else{
          this.mapWeather(response.data.wx_desc)
        }
 
      })
      .catch( (error:any) => {
        console.log(error)
      })    
  }

  mapWeather(weather: string){
  
    let simpleWeather: Weather
    if ( weather.match(/(thunder)/gi) ){       //// can we do this neater w/out so many ifs?
      simpleWeather = Weather.storm;
      this.startRain(100)
    } else if (weather.match(/(snow|ice)/gi) ){
      simpleWeather = Weather.snow
      this.startFlakes(500)
    } else if (weather.match(/(heavy|torrential)/gi) ){
      simpleWeather = Weather.heavyRain
      this.startRain(50)
    } else if (weather.match(/(rain|drizzle|shower)/gi) ){
      simpleWeather = Weather.rain
      this.startRain(500)
    } else if (weather.match(/(cloud|overcast|fog|mist)/gi) ){
      simpleWeather = Weather.clouds
    } else {
      simpleWeather = Weather.sun
    }
    this.setState({weather: simpleWeather })
  
    console.log(weather)
    console.log(this.state.weather)  
  }

  startRain(interval: number){
    setInterval( f =>{
      this.addDrop()
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
      console.log("deleted" + dropName )
      }, dropSpeed)

  }
  
  startFlakes(interval: number){
    setInterval( f =>{
      this.addFlake()
      }, interval)  
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
      console.log("deleted" + flakeName )
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
    let lightningNum:number = Math.floor(Math.random()*25)
    //lightningNum =+  Math.floor( (Math.random()*2 ) -1)
    //lightningNum % 5
    if (lightningNum>6)
    {
      return
    }
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
