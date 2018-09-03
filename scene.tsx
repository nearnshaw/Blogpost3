import * as DCL from 'decentraland-api'
import { Vector3Component } from 'decentraland-api'
const axios = require('axios')


let fakeWeather: string | null = 'thunder'



// temp
//let dropsUp: number = 0
//let dropsDown: number = 0

const appId: string = 'bb6063b3'
const APIkey: string = '2e55a43d3e62d76f145f28aa7e3990e9'
const lat: string = '-34.55'
const lon: string = '-58.46'

let objectCounter: number = 0
const dropSpeed: number = 3000
const flakeSpeed: number = dropSpeed * 4
//let precipitationLoop: any = null

const callUrl: string =
  'http://api.weatherunlocked.com/api/current/' +
  lat +
  ',%20' +
  lon +
  '?app_id=' +
  appId +
  '&app_key=' +
  APIkey

export function sleep(ms: number = 0) {
  return new Promise(r => setTimeout(r, ms));
}

export enum Weather {
  sun,
  clouds,
  rain,
  heavyRain,
  snow,
  storm
}

// drop id, position, visible?
export type Drops = {
  [key: string]: [Vector3Component, boolean]
}

export type Flakes = {
  [key: string]: [Vector3Component, Vector3Component, string, boolean]
}

// This is an interface, you can use it to enforce the types of your state
export interface IState {
  weather: Weather
  drops: Drops
  flakes: Flakes
}

export default class HouseScene extends DCL.ScriptableScene<any, IState> {
  // This is your initial state and it respects the given IState interface
  state: IState = {
    weather: Weather.sun,
    drops: {}, ////   WHYYYY the as any?????    implicitly of type any
    flakes: {}
  }

  sceneDidMount() {
    setInterval(this.getWeather(), 1000000)
  }

  getWeather() {
    let weather: Weather
    if (fakeWeather) {
      weather = this.mapWeather(fakeWeather)
    } else {
      axios
        .get(callUrl)
        .then((response: any) => {
          console.log(response.data.wx_desc)
          weather = this.mapWeather(response.data.wx_desc)
          if (weather == this.state.weather) {
            return
          }
          this.setState({ weather: weather, drops: {}, flakes: {} })
          if (weather == (Weather.sun | Weather.clouds)) {
            return
          }
          this.startPrecipitation()
        })
        .catch((error: any) => {
          console.log(error)
        })
    }
  }

  mapWeather(weather: string) {
    let simpleWeather: Weather
    if (weather.match(/(thunder)/gi)) {
      simpleWeather = Weather.storm
    } else if (weather.match(/(snow|ice)/gi)) {
      simpleWeather = Weather.snow
    } else if (weather.match(/(heavy|torrential)/gi)) {
      simpleWeather = Weather.heavyRain
    } else if (weather.match(/(rain|drizzle|shower)/gi)) {
      simpleWeather = Weather.rain
    } else if (weather.match(/(cloud|overcast|fog|mist)/gi)) {
      simpleWeather = Weather.clouds
    } else {
      simpleWeather = Weather.sun
    }
    console.log('literal weather: ' + weather)
    console.log('simple weather: ' + simpleWeather)
    return simpleWeather
  }

  startPrecipitation() {
    switch (this.state.weather) {
      case Weather.storm:
        this.startRain(50)
        break
      case Weather.snow:
        this.startSnow(75)
        break
      case Weather.heavyRain:
        this.startRain(100)
        break
      case Weather.rain:
        this.startRain(25)
        break
    }
  }

  async startRain(drops: number) {
    let dropsAdded: Drops = {}
    for (let drop = 0; drop < drops; drop++) {
      let newDrop: Vector3Component = {
        x: (Math.random() * 9) + 0.5,
        y:9,
        z: (Math.random() * 9) + 0.5
      }
      const dropName = 'drop' + objectCounter++
      dropsAdded[dropName] = [newDrop, false]
    }
    this.setState({ drops: dropsAdded })
    for (let drop in this.state.drops) {
      this.updateDrop(drop)
      await sleep(dropSpeed/drops )
    }    
  }

  async updateDrop(drop: string) {
    let dropsAdded: Drops = { ...this.state.drops }
    dropsAdded[drop][0].y = -1
    dropsAdded[drop][1] = true
    this.setState({ drops: dropsAdded })

    await sleep(dropSpeed) 
    dropsAdded = { ...this.state.drops }
    let newDrop: Vector3Component = {
      x: (Math.random() * 9) + 0.5,
      y: 9,
      z: (Math.random() * 9) + 0.5
    }
    dropsAdded[drop] = [newDrop, false]
    this.setState({ drops: dropsAdded })
    await sleep(10) 
    if (this.state.weather == Weather.storm || Weather.rain || Weather.heavyRain)
    {
      this.updateDrop(drop)
    } 
  }


  async startSnow(flakes: number) {
    let flakesAdded: Flakes = {}
    for (let flake = 0; flake < flakes; flake++) {
      let newFlakePos: Vector3Component = {
        x: (Math.random() * 9) + 0.5,
        y: 9,
        z: (Math.random() * 9) + 0.5
      }
      let newFlakeRot: Vector3Component = {
        x: Math.random() * 360,
        y: Math.random() * 360,
        z: Math.random() * 360
      }
      let flakeType = "#flake" + Math.ceil(Math.random()*20)
      const flakeName = 'flake' + objectCounter++
      flakesAdded[flakeName] = [newFlakePos, newFlakeRot, flakeType, false]
    }
    this.setState({ flakes: flakesAdded })
    for (let flake in this.state.flakes) {
      this.updateFlake(flake)
      await sleep(flakeSpeed/flakes )
    }    
  }

  async updateFlake(flake: string) {
    let flakesAdded: Flakes = { ...this.state.flakes }
    flakesAdded[flake][0].y = -1
    flakesAdded[flake][3] = true
    this.setState({ flakes: flakesAdded })

    await sleep(flakeSpeed) 
    flakesAdded = { ...this.state.flakes }
    let newFlakePos: Vector3Component = {
      x: (Math.random() * 9) + 0.5,
      y: 9,
      z: (Math.random() * 9) + 0.5
    }
    let newFlakeRot: Vector3Component = {
      x: Math.random() * 360,
      y: Math.random() * 360,
      z: Math.random() * 360
    }
    let flakeType = "#flake" + Math.ceil(Math.random()*20)
    flakesAdded[flake] = [newFlakePos, newFlakeRot, flakeType, false]
    this.setState({ flakes: flakesAdded })
    await sleep(10) 
    if (this.state.weather == Weather.snow)
    {
      this.updateFlake(flake)
    } 
  }


  renderClouds(cloudType: string) {
    switch (cloudType) {
      case 'dark':
        return (
          <gltf-model
            src={'models/dark-cloud.gltf'}
            position={{ x: 5, y: 8, z: 5 }}
            scale={4.5}
          />
        )
      case 'white':
        return (
          <gltf-model
            src={'models/clouds/clouds.gltf'}
            position={{ x: 9, y: 4, z: 1 }}
            scale={3.5}
          />
        )
    }
  }

  renderDrops() {
    let dropModels: any[] = []
    dropModels.push(
      <material
        id="drop"
        albedoTexture="materials/drop.png"
        hasAlpha
      />
    )
    for (var drop in this.state.drops) {
      //console.log("rendering drop " + drop)
      dropModels.push(
        <plane
          key={drop}
          material="#drop"
          scale={0.1}
          billboard={2}
          position={this.state.drops[drop][0]}
          visible={this.state.drops[drop][1]}
          transition={
            this.state.drops[drop][1]? {}:  
            {position: { duration: dropSpeed, timing: 'linear' }}
          }
        />
      )
    }
    return dropModels
  }

  renderFlakes() {
    let flakeModels: any[] = []
    for (let i = 1; i <= 20; i ++)
    {
      flakeModels.push(
        <basic-material
          id={"flake" + i}
          texture={"materials/flake" + i + ".png"}
        />
      )
    }
    for (var flake in this.state.flakes) {
      flakeModels.push(
        <plane
          key={flake}
          scale={0.25}
          position={this.state.flakes[flake][0]}
          rotation={this.state.flakes[flake][1]}
          material={this.state.flakes[flake][2]}
          visible={this.state.flakes[flake][3]}
          transition={
            this.state.flakes[flake][3]? {}:  
            {position: { duration: flakeSpeed, timing: 'linear' },
            rotation: { duration: flakeSpeed, timing: 'linear' }
            } 
          }
        />
      )
    }
    return flakeModels
  }

  renderLightNing() {
    let lightningNum: number = Math.floor(Math.random() * 25) + 1
    if (lightningNum > 6) {
      return
    }
    return (
      <gltf-model
        src={'models/ln' + lightningNum + '.gltf'}
        position={{ x: 5, y: 8, z: 5 }}
        scale={4}
      />
    )
  }

 renderHouse() {
    return (
      <gltf-model
        src="models/House.gltf"
        scale={1}
        position={{ x: 5, y: 0, z: 5 }}
      />
    )
  }

  async render() {
    switch (this.state.weather) {
      case Weather.sun:
      return (
        <scene>
          {this.renderHouse()}
        </scene>
           )
      case Weather.clouds:
        return (
          <scene>
            {this.renderClouds('white')}
            {this.renderHouse()}
          </scene>
             )
      case Weather.rain:
        return (
          <scene>
            {this.renderClouds('white')}
            {this.renderDrops()}
            {this.renderHouse()}
          </scene>
        )
      case Weather.heavyRain:
        return (
          <scene>
            {this.renderClouds('dark')}
            {this.renderDrops()}
            {this.renderHouse()}
          </scene>
        )
      case Weather.snow:
        return (
          <scene>
            {this.renderClouds('dark')}
            {this.renderFlakes()}
            {this.renderHouse()}
          </scene>
        )
      case Weather.storm:
        return (
          <scene>
            {this.renderClouds('dark')}
            {this.renderDrops()}
            {this.renderLightNing()}
            {this.renderHouse()}
          </scene>
        )
    }
  }
}



//http://api.weatherunlocked.com/api/current/-34.55,%20-58.46?app_id=bb6063b3&app_key=2e55a43d3e62d76f145f28aa7e3990e9
