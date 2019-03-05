import React, { Component } from 'react'
import axios from 'axios'

export default class Fib extends Component {
  state = {
    seenIndexes: [],
    values: {},
    index: '',
    indexBackup: ''
  }

  componentDidMount() {
    this.fetchValues()
    this.fetchIndexes()
  }

  handleIndexChange = event => {
    const { value } = event.target
    if (value) {
      this.setState(prevState => {
        return { ...prevState, index: value, indexBackup: value }
      })
    }
  }

  handleIndexSubmit = async evt => {
    evt.preventDefault()
    const { index } = this.state
    await axios.post('/api/values', {
      index
    })
    this.fetchIndexes()
    this.fetchValues()
    this.setState(prevState => {
      return { ...prevState, index: '' }
    })
  }

  renderSeenIndexes = () => {
    const { seenIndexes } = this.state
    return seenIndexes.map(item => item.number).join(', ')
  }

  renderValues() {
    const entries = []
    const { values } = this.state
    if (values.key) {
      entries.push(
        <div key={values.key}>
          For key {values.key} my value is {values.value}
        </div>
      )
    }
    return entries
  }

  render() {
    const { index } = this.state
    return (
      <div>
        <form>
          <label>Enter your index:</label>
          <input
            type="text"
            name="index"
            value={index}
            placeholder="Enter index"
            onChange={this.handleIndexChange}
          />
          <button type="submit" onClick={this.handleIndexSubmit}>
            Submit
          </button>
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
    let newValue = {}
    newValue.key = this.state.indexBackup
    newValue.value = values.data
    this.setState(prevState => {
      return { ...prevState, values: newValue }
    })
  }

  async fetchIndexes() {
    const seenIndexes = await axios.get('/api/values')
    this.setState(prevState => {
      return { ...prevState, seenIndexes: seenIndexes.data }
    })
  }
}
