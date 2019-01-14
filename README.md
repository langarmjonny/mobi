## Mobi
Dieses Repository zeigt die Möglichkeit der Anwendung der Blockchain-Technologie im Rahmen eines PKW-Platoonings.
Dabei wird aufgezeigt wie Transaktionen zur Kompensation des ersten Fahrzeugs automatisch über den IOTA Tangle ausgeführt werden. Zusätzlich wird aufgrund der Nachvollziehbarkeit und Transparenz der aktuelle Status des Platooning in den Tangle geschrieben. Dies haben wir zur besseren Veranschaulichung auf selbst gebauten autonom fahrenden Autos implementiert, die auf einem definierten Kurs platoonen und Transaktionen über den IOTA Tangle austauschen.

In diesem Repository befindet sich Arduino Code um die selbst gebauten Autos autonom fahren zu lassen. Zudem behinhält es NodeJs Code, der das Platooning startet und stoppt und mit dem IOTA Tangle kommuniziert, auf Transaktionen höhrt und Transaktionen sendet.

## Screenshots
![alt text](https://raw.githubusercontent.com/MatthiasBabel/mobi/blob/master/screenshot.png)

## Installation
1. Install Compass from https://github.com/iotaledger/compass
2. Open all remote options of IRI set PORT to 14265, enable ZMQ and set the ZMQ_PORT to 5555
3. Install Angular-CLI  
  ```
  npm i @angular/cli
  ```
4. Setup and install
```
$ clone https://github.com/MatthiasBabel/mobi
$ cd mobi
$ npm install
$ cd frontend
$ npm install
$ cd ..
$ nano src/config.json
```
5. Configure IPs
If you run both platooning participants on one device use 127.0.0.1
```
$ nano src/config.json
$ nano frontend/src/app/site/config.json
```

## Run it
```
$ node src/passivePlatooning.js
$ node src/activePlatooning.js
$ cd frontend
$ ng serve
```
Now you are able to simulate the platooning payments on your browser.
For simplicity you control both participants


## Credits
Give proper credits. This could be a link to any repo which inspired you to build this project, any blogposts or links to people who contrbuted in this project.
