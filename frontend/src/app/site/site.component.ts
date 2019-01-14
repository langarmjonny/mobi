import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import * as p5 from 'p5';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'text/html',
    //'Access-Control-Allow-Origin' : 'http://localhost:8080/RobotinoApp/Servlet',
  })
}

@Component({
  selector: 'app-site',
  templateUrl: './site.component.html',
  styleUrls: ['./site.component.scss']
})


export class SiteComponent implements OnInit {


  constructor(
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.checkForRequest();
    this.createCanvas();
  //  this.getResponse();
  }

  private p5;

  platoonAvailable = false;
  request = false;

  config = require('./config.json');

  private sketch(p: any, home: any) {
    let speed, background, wHeight, wWidth, car, tacho, carImage, platoonAvailable, isPlatooning, requested, passiv, active, shadow, animation, background2, time;

    p.preload = () => {
      let load = require('./dashboard.png');
      background = p.loadImage(load);
      load = require('./car.png');
      carImage = p.loadImage(load);
      load = require('./passiv.png');
      passiv = p.loadImage(load);
      load = require('./active.png');
      active = p.loadImage(load);
      load = require('./shadow.png');
      shadow = p.loadImage(load);
      load = require('./background2.png');
      background2 = p.loadImage(load);
    }

    p.keyTyped = () => {
      if (p.key === 's')
        p.requested = !p.requested;
      if (p.key === 'o') {
        p.isPlatooning = !p.isPlatooning;
        p.requested = false;
      }
      if (p.key === 'a')
        p.platoonAvailable = !p.platoonAvailable;
    }

    p.setup = () => {
      wWidth = p.windowWidth;
      wHeight = background.height * wWidth / background.width;
      console.log(this);
      let cnv = p.createCanvas(wWidth, wHeight);
      car = new Car();
      tacho = new Tacho();
      animation = new Animation();
      time = new Time();
      platoonAvailable = false;
      requested = false;
      p.textAlign(p.CENTER, p.CENTER);

    }

    p.draw = () => {
      p.image(background, 0, 0, wWidth, background.height * wWidth / background.width);

      animation.show();
      if (p.isPlatooning)
        animation.zoomIn();
      else
        animation.zoomOut();
      p.image(background2, 0, 0, wWidth, background.height * wWidth / background.width);
      tacho.show();
      car.show();
      time.show();

      if (p.platoonAvailable)
        car.zoomIn();
      else
        car.zoomOut();
    }

    function Time() {
      this.x = wWidth / 2.35;
      this.y = wHeight / 1.35;
      this.show = () => {
        p.push();
        p.translate(this.x, this.y);
        var h = p.hour();
        var m = p.minute();
        if(m < 10)
          m = "0" + m;
        if(h < 10)
          h = "0" + h;
        var time = h + ":" + m;
        p.textSize(20);
        p.noStroke();
        p.fill(255);
        p.text(time, 0, 0);
        p.pop();
      }
    }


    function Tacho() {
      this.x = wWidth / 3.62;
      this.y = wHeight / 2.18;
      this.size = 10;

      this.length = wWidth / 7.8;

      this.show = () => {
        p.push();
        p.translate(this.x, this.y);
        //this.speed = Number(p.speed);
        this.speed = p.map(p.mouseX, 0, wWidth, 0, 260);
        let val = p.map(this.speed, 0, 260, 0, 1363);
        p.angleMode(p.RADIANS);
        p.strokeWeight(5);
        p.stroke(255);
        let val2 = p.map(this.speed, 0, 260, -218, 40)
        let leng = wWidth/17;
        p.line(p.cos(p.PI + (val + 1680) / 300) * (this.length - leng), p.sin(p.PI + (val + 1680) / 300) * (this.length - leng), p.cos(p.PI + (val + 1680) / 300) * this.length, p.sin(p.PI + (val + 1680) / 300) * this.length);
        p.noFill();
        p.angleMode(p.DEGREES);
        p.arc(0, 0, this.length * 2, this.length * 2, -219, val2-1);
        p.textSize(80);
        p.noStroke();
        p.fill(255);
        p.text((p.floor(this.speed)), 0, 0);
        p.pop();
      }
    }

    function Animation() {
      this.scale = 0;
      this.size = wWidth / 6000;
      this.x = wWidth / 1.4;
      this.y = wHeight / 2.75;
      this.dist = wWidth / 5;
      this.distActive = wWidth / 17;
      this.distPassive = wWidth / 5;
      this.zoom = 100;
      this.occ = 0;
      this.zoomBool = true;
      this.speed = wWidth / 400;
      this.on = false;
      this.counter = 0;

      this.show = () => {
        p.push();
        p.translate(this.x, this.y);
        p.image(passiv, -this.dist, 0, passiv.width * this.size, passiv.height * this.size);
        p.image(active, +this.dist, 0, active.width * this.size, active.height * this.size);
        p.tint(255, this.occ);
        p.image(shadow, +this.dist - wWidth/18, 0, passiv.width * this.size, passiv.height * this.size);
        p.textSize(30);
        p.noStroke();
        p.fill(255);
        p.text("Platooning", wWidth/40, -wWidth/40);
        p.textSize(70);
        if(this.on){
          p.fill(0,255,0);
          p.text("ON", wWidth/40, wWidth/8);
        }
        else {
          if(!p.requested) {
            p.fill(255, 0, 0);
            p.text("OFF", wWidth/40, wWidth/8);
          }
        }
        this.request();
        p.pop();
      }

      this.request = () => {
        //this.counter += p.PI/4;
        if(p.requested) {
          p.push();
          p.translate(wWidth/40, wWidth/40);
        //  p.scale(p.map(p.sin(this.counter), -1, 1, 1, 1.3));
          p.textSize(20);
          p.noStroke();
          p.fill(255);
          p.text("requested", 0, 0);
          p.pop();
        }

      }

      this.zoomOut = () => {
        if (this.dist < this.distPassive && this.zoomBool) {
          this.dist = p.constrain(this.dist + this.speed, this.distActive, this.distPassive);
          this.on = false;
        }
        else if (this.zoomBool) {
          this.zoomBool = false;
          this.occ = 0;
        }
      }

      this.zoomIn = () => {

        if (this.dist > this.distActive && !this.zoomBool) {
          this.dist = p.constrain(this.dist - this.speed, this.distActive, this.distPassive);
        }
        else if (this.occ < 255) {
          this.occ = p.constrain(this.occ + 5, 0, 255);
          if (this.occ > 130 && !this.on) {
            this.on = true;
          }
        }
        else {
          this.zoomBool = true;
        }
      }

    }

    function Car() {
      this.scale = 0;
      this.size = wWidth / 170;
      this.x = wWidth / 1.97;
      this.y = wHeight / 2.65;
      this.zoom = 45;
      this.occ = 0;
      this.zoomBool = false;

      this.show = () => {
        p.push();
        p.translate(this.x, this.y);
        p.scale(this.scale);
        p.tint(255, this.occ);
        p.image(carImage, -(carImage.width * this.size / 2), 0, carImage.width * this.size, carImage.height * this.size);
        p.pop();
      }

      this.zoomOut = () => {
        if (this.zoomBool && this.zoom > 45) {
          this.scale = p.sin(p.map(this.zoom, 0, 100, 0, p.PI / 2));
          this.zoom = p.constrain(this.zoom - 1, 0, 100);
          this.occ = p.constrain(this.occ - 4.8, 0, 255);
        } else {
          this.zoomBool = false;
        }
      }

      this.zoomIn = () => {
        if (!this.zoomBool && this.zoom < 100) {
          this.scale = p.sin(p.map(this.zoom, 0, 100, 0, p.PI / 2));
          this.zoom = p.constrain(this.zoom + 1, 0, 100);
          this.occ = p.constrain(this.occ + 4.8, 0, 255);
        } else {
          this.zoomBool = true;
        }
      }
    }

    p.windowResized = () => {

      wHeight = p.windowHeight;
      wWidth = p.windowWidth;
    }
  }

  private createCanvas() {
    this.p5 = new p5(this.sketch, document.getElementById('sketch'));
  }




















    platoonAvai() {
      this.platoonAvailable = !this.platoonAvailable;
      this.p5.platoonAvailable = !this.p5.platoonAvailable;
      console.log(this.p5);
    }

    drivePassive() {
      this.sendData({ command: 'drive' }, 'http://' + this.config.passive.ip + ':8031/commands').then(res => console.log(res));
    }
    startPlatooning() {
      console.log(this.p5);
      this.p5.requested = true;
      this.sendData({ command: 'startPlatooning' }, 'http://' + this.config.passive.ip + ':8031/commands').then(res => console.log(res));
    }
    acceptPlatooning() {
      this.p5.requested = false;
      this.p5.isPlatooning = true;
      this.sendData({ command: 'acceptPlatooning' }, 'http://' + this.config.active.ip + ':8030/commands').then(res => console.log(res));
    }
    stopPlatooning() {
      this.p5.requested = false;
      this.p5.isPlatooning = false;
      this.sendData({ command: 'stopPlatooning' }, 'http://' + this.config.passive.ip + ':8031/commands').then(res => console.log(res));
    }
    driveActive() {
      this.sendData({ command: 'drive' }, 'http://' + this.config.active.ip + ':8030/commands').then(res => console.log(res));
    }
    checkForRequest() {
      this.getData('http://' + this.config.active.ip + ':8030/address').then(res => { this.request = (<any>res).openRequests.bool });
      console.log(this.request);
      setTimeout(() => this.checkForRequest(), 1000);
    }
    getResponse() {
      this.speedData({ command: 'getResponse' }, 'http://' + this.config.passive.ip + ':8031/commands').then(res => { this.p5.speed = res});
      setTimeout(() => this.getResponse(), 1000);
    }

    speedData(data: any, url: any) {
      //return this.http.post(url, data, httpOptions);
      return new Promise((resolve, reject) => {
        const httpOptions = {
          /*  headers: new HttpHeaders({
              'Content-Type':  'application/json'
            }),
            observe: 'response',
            responseType: 'json'*/
        };

        const req = this.http.post(url, data, httpOptions)
          .subscribe(
            res => {
              resolve(res);
            },
            err => {
              reject(err);
            }
          );
      });
    }

    sendData(data: any, url: any) {
      //return this.http.post(url, data, httpOptions);
      return new Promise((resolve, reject) => {
        const httpOptions = {
          /*  headers: new HttpHeaders({
              'Content-Type':  'application/json'
            }),
            observe: 'response',
            responseType: 'json'*/
        };

        const req = this.http.post(url, data, httpOptions)
          .subscribe(
            res => {
              resolve((<any>res).body);
            },
            err => {
              reject(err);
            }
          );
      });
    }

    getData(url: any) {
      //return this.http.post(url, data, httpOptions);
      return new Promise((resolve, reject) => {
        const httpOptions = {
          /*  headers: new HttpHeaders({
              'Content-Type':  'application/json'
            }),
            observe: 'response',
            responseType: 'json'*/
        };

        const req = this.http.get(url, httpOptions)
          .subscribe(
            res => {
              console.log(res);
              resolve(res);
            },
            err => {
              reject(err);
            }
          );
      });
    }
  }
