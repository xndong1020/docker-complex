import React, { Component } from 'react'
import axios from 'axios'

export default class Fib extends Component {
  state = {
    seenIndexes: [],
    values: {},
    index: ''
  }

  componentDidMount() {
    this.fetchValues()
    this.fetchIndexes()
  }

  handleIndexChange = event => {
    const { value } = event.target
    if (value) {
      this.setState(prevState => {
        return { ...prevState, index: value }
      })
    }
  }

  handleIndexSubmit = async event => {
    event.preventDefault()
    const { index } = this.state
    await axios.post('/api/values', {
      index
    })
    this.setState(prevState => {
      return { ...prevState, index: '' }
    })
  }

  renderSeenIndexes = () => {
    const { seenIndexes } = this.state
    return seenIndexes.join(', ')
  }

  renderValues() {
    const entries = []
    const { values } = this.state
    for (let key in values) {
      entries.push(
        <div key={key}>
          For index {key} I calculated {values[key]}
        </div>
      )
    }
  }

  render() {
    const { index } = this.state
    return (
      <div>
        <form>
          <label htmlFor="">Enter your index:</label>
          <input
            type="text"
            name="index"
            value={index}
            placeholder="Enter index"
            onChange={this.handleIndexChange}
          />
          <button onSubmit={this.handleIndexSubmit}>Submit</button>
        </form>

        <h3>Indexes I have seen:</h3>
        {this.renderSeenIndexes()}

        <h3>Calculated Values:</h3>
        {this.renderValues()}
      </div>
    )
  }

  async fetchValues() {
    const values = await axios.get('/api/values/current')
    this.setState(prevState => {
      return { ...prevState, values: values.data }
    })
  }

  async fetchIndexes() {
    const seenIndexes = await axios.get('/api/values')
    this.setState(prevState => {
      return { ...prevState, seenIndexes: seenIndexes.data }
    })
  }
}
