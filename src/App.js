import React, { Component } from 'react';
import './App.css';
import { Button } from 'react-bootstrap';
import { DBConfig } from './indexedsb/dbconfig';
import { initDB, IndexedDB, useIndexedDB } from 'react-indexed-db';


initDB(DBConfig);

class App extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.db = useIndexedDB('activities');
  }

  makerequest(url, page = 1) {
    const results = fetch(
      url + page, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'accept': 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript',
        'x-requested-with': 'XMLHttpRequest'
      }
    }
    )
      .then((res) => res.json())
      .then((data) => data)
      .catch(error => console.log(error))
    return results
  }

  addRecordsToDB(activities) {
    const { add } = this.db;
    activities.forEach((activity, i, activities) => {
      add(activity)
        .then(event => { console.log('Inserted: ', event) },
          error => { console.log('Exists already:', error) }
        );
    });
  }

  handleClick() {
    const { getByIndex } = this.db;
    getByIndex('workout_type', 'sync').then(response => {
      console.log('Got time:', response)
    });
    
    const url = 'https://www.strava.com/athlete/training_activities?activity_type=NordicSki&page='
    this.makerequest(url).then(response => {
      this.addRecordsToDB(response.models)
      const pages = Math.ceil(response.total / response.perPage)
      for (let i = pages; i > 1; i--) {
        this.makerequest(url, i).then(response => this.addRecordsToDB(response.models))
      }
    })
    this.addRecordsToDB([{'sync_time': new Date().toISOString(), workout_type: 'sync'}])

    // todo Resolve issue with creating 2 stores
    // const { add:add_utils } = useIndexedDB('utils');
    // const now = new Date().toISOString()
    // add_utils({sync_time: now})
    // .then(event => {console.log('Inserted: ', event)},
    //   error => {console.log('Exists already:', error)}
    // );

  }

  render() {
    return (
      <div className="App">
          <h2>Welcome to SKI</h2>
          <p className="card">
            <Button onClick={this.handleClick}>Warning</Button>
          </p>
      </div>
    );
  }
}

export default App;


