import { Component, OnInit } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import ImageryLayer from '@arcgis/core/layers/ImageryLayer';

// URL untuk layanan cuaca
const weatherServiceUrl = 'https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  mapView: MapView | any;
  userLocationGraphic: Graphic | any;
  map: Map | any;

  // Daftar basemap yang tersedia
  basemapList = [
    { label: 'Streets', value: 'streets' },
    { label: 'Satellite', value: 'satellite' },
    { label: 'Hybrid', value: 'hybrid' },
    { label: 'Topographic', value: 'topo' },
    { label: 'Gray', value: 'gray' },
    { label: 'Dark Gray', value: 'dark-gray' },
    { label: 'Terrain', value: 'terrain' },
    { label: 'OpenStreetMap', value: 'osm' },
  ];

  constructor() {}

  //Inisialisasi peta, menambahkan layer cuaca, dan menampilkan lokasi pengguna.
  async ngOnInit() {
    this.map = new Map({
      basemap: 'gray',  // Basemap default
    });

    this.mapView = new MapView({
      container: 'container',
      map: this.map,
      zoom: 8
    });

    let weatherServiceFL = new ImageryLayer({ url: weatherServiceUrl });
    this.map.add(weatherServiceFL);

    // menambahkan koordinat dibawah radar cuaca
    weatherServiceFL.when(() => {
      this.addMarkerInRadarArea(-81.804393, 36.105740); 
      this.addMarkerInRadarArea(-91.027495, 39.104866); 
      this.addMarkerInRadarArea(-85.131683, 44.910362); 
    });


    await this.updateUserLocationOnMap();
    this.mapView.center = this.userLocationGraphic.geometry as Point;
    setInterval(this.updateUserLocationOnMap.bind(this), 10000);
  }

  // Fungsi untuk menangani perubahan basemap sesuai pilihan pengguna yang dipilih dari daftar dropdown.
  onBasemapChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const basemapType = target.value;
    console.log('Selected basemap:', basemapType);  // Debug log
    this.changeBasemap(basemapType);
  }

  // Fungsi untuk mengubah basemap dengan tipe yang dipilih oleh pengguna.
  changeBasemap(basemapType: string) {
    console.log('Changing basemap to:', basemapType);  // Debug log
    this.map.basemap = basemapType;  // Ganti basemap berdasarkan pilihan
  }

  // Mendapatkan lokasi pengguna menggunakan geolocation API, mengembalikan koordinat lintang dan bujur
  // Mengembalikannya dalam bentuk Promise yang berisi array angka [latitude, longitude]
  async getLocationService(): Promise<number[]> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition((resp) => {  //mengambil lokasi pengguna
        resolve([resp.coords.latitude, resp.coords.longitude]);
      });
    });
  }

  //Menampilkan lokasi pengguna pada peta, atau memperbarui lokasinya jika sudah ada.
  async updateUserLocationOnMap() {
    let latLng = await this.getLocationService();
    let geom = new Point({ latitude: latLng[0], longitude: latLng[1] });
    if (this.userLocationGraphic) {
      this.userLocationGraphic.geometry = geom;
    } else {
      this.userLocationGraphic = new Graphic({
        symbol: new SimpleMarkerSymbol(),
        geometry: geom,
      });
      this.mapView.graphics.add(this.userLocationGraphic);
    }
  }

  addMarkerInRadarArea(longitude: number, latitude: number) {
    const radarMarker = new Graphic({
      geometry: new Point({
        longitude: longitude,
        latitude: latitude
      }),
      symbol: new SimpleMarkerSymbol({
        color: "red",
        size: "12px",
        outline: {
          color: "white",
          width: 2
        }
      })
    });

    this.mapView.graphics.add(radarMarker);
  }
}


  

  // constructor() {}
  // private latitude: number | any;
  // private longitude: number | any;

  // public async ngOnInit() {
  //   // this.longitude = 116.306277;
  //   // this.latitude = -8.899927;

  //   // Get the current position
  //   const position = await Geolocation.getCurrentPosition();
  //   this.latitude = position.coords.latitude;
  //   this.longitude = position.coords.longitude;

  //   // Create the map
  //   const map = new Map({
  //     // basemap: "topo-vector"
  //     basemap: "dark-gray"
  //   });

  //   // Create the map view
  //   const view = new MapView({
  //     container: "container",
  //     map: map,
  //     zoom: 14,
  //     center: [this.longitude, this.latitude] // Corrected: longitude first, then latitude
  //   });

  //   // Create a Point geometry
  //   const point = new Point({
  //     longitude: this.longitude,
  //     latitude: this.latitude
  //   });

  //   // Create a marker symbol
  //   const markerSymbol = {
  //     type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
  //     color: [9, 255, 207], 
  //     outline: {
  //       color: [255, 255, 255], // White
  //       width: 3
  //     }
  //   };

  //   // Create a Graphic and set its geometry and symbol
  //   const pointGraphic = new Graphic({
  //     geometry: point,
  //     symbol: markerSymbol
  //   });

  //   // Add the Graphic to the view
  //   view.graphics.add(pointGraphic);
  // }