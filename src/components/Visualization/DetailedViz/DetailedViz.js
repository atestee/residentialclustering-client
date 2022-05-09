import { Component } from "react";
import './DetailedViz.css';
import {Heatmap} from "../../Maps/Heatmap";
import {IncludedExcludedMap} from "../../Maps/IncludedExcludedMap";
import {BarChart, Bar, Cell, XAxis, Legend, Pie, PieChart} from 'recharts';
import colorGradient from "javascript-color-gradient";
import {
    HeaderForDetailedVisualization
} from "../../Headers/HeaderForDetailedVisualization";

function getColorGradientArray(numberOfBins, startColor, middleColor, endColor) {
    const middle = Math.floor(numberOfBins/2)
    let arr1 = colorGradient.setGradient(startColor, middleColor).setMidpoint(middle).getArray();
    let arr2 = colorGradient.setGradient(middleColor, endColor).setMidpoint(numberOfBins - middle).getArray();
    return arr1.concat(arr2);
}


export class DetailedViz extends Component {
    nbins = JSON.parse(this.props.storage.getItem("jobData"))["parameters"]["nbins"]
    colorGradientArray = getColorGradientArray(this.nbins, "#00ff1a", "#ffd500", "#ff0000");
    colorGradientArrayFaded = getColorGradientArray(this.nbins, "#9ffdac", "#f6e891", "#f18080");
    pieChartColors = ["#a743ff", "#1680ff"]

    pieChartData = [
        {"name": "productiveAge", "value": 46.7},
        {"name": "non-productiveAge", "value": 53.3}
    ]

    jobData = JSON.parse(this.props.storage.getItem("jobData"))
    clusterIdx = this.props.storage.getItem("clusterIdx")
    clusterData = this.jobData["clusters"][this.clusterIdx]
    parameters = this.jobData["parameters"]
    clusterName = this.clusterData.geography.features[0].properties.name

    constructor(props) {
        super(props);
        this.state = {
            shownMap: "heatMap",
            metricsDrawerOpen: true,
            focusedDistanceGroupIndex: null,
        }
        this.taxiRideDurationHist = this.clusterData.histograms["taxiRideDurationMinutes"];
        let delta = (this.parameters.maxTaxiRideDurationMinutes / this.nbins);
        this.taxiRideDurationHistData = this.taxiRideDurationHist.map((elem, index) => {
            const start = (index * delta);
            const end = (index + 1) * delta;
            const start_min = Math.floor(start);
            const start_secs = (start - start_min) * 60;
            const end_min = Math.floor(end);
            const end_secs = (end - end_min) * 60;

            const start_str = start_min.toLocaleString("en-US", {minimumIntegerDigits: 2}) + ":" + Number(start_secs.toFixed(0)).toLocaleString("en-US", {minimumIntegerDigits: 2})
            const end_str = end_min.toLocaleString("en-US", {minimumIntegerDigits: 2}) + ":" + Number(end_secs.toFixed(0)).toLocaleString("en-US", {minimumIntegerDigits: 2})

            return ({
                "value": elem,
                "key": start_str + " - " + end_str
            })
        })

        this.taxiRideDistanceHist = this.clusterData.histograms["taxiRideDistanceMeters"];
        delta = this.parameters.maxDrivingDistanceMeters / this.nbins;

        this.taxiRideDistanceHistData = this.taxiRideDistanceHist.map((elem, index) => ({
            "value": elem,
            "key": String((index * delta / 1000).toFixed(1)) + " - " + String(((index + 1) * delta / 1000).toFixed(1))
        }))
    }

    showMap() {
        switch (this.state.shownMap) {
            case "heatMap":
                return (
                    <Heatmap
                        setShownMap={this.setShownMap.bind(this)}
                        clusterPolygon={this.clusterData.geography}
                        includedResidentialBuildings={this.clusterData.includedResidentialBuildings}
                        feedingTransitStops={this.clusterData.feedingTransitStops}
                        jobParameters={this.parameters}
                        colorGradientArray={this.colorGradientArray}
                        colorGradientArrayFaded={this.colorGradientArrayFaded}
                        legendValuesArray={Object.values(this.taxiRideDistanceHistData.map((elem) => (elem.key)))}
                        focusedDistanceGroupIndex={this.state.focusedDistanceGroupIndex}
                        nbins={this.nbins}
                    />
                )
            case "includedExcludedMap":
               return (
                   <IncludedExcludedMap
                        feedingTransitStops={this.clusterData.feedingTransitStops}
                        setShownMap={this.setShownMap.bind(this)}
                        clusterPolygon={this.clusterData.geography}
                        includedResidentialBuildings={this.clusterData.includedResidentialBuildings}
                        excludedResidentialBuildings={this.clusterData.excludedResidentialBuildings}
                        nbins={this.nbins}
                   />
               )
            default:
                return (<Heatmap centerCoords={JSON.parse(this.props.storage.getItem("centerCoords"))} setShownMap={this.setShownMap.bind(this)}/>)
        }
    }

    putFocusOnDistanceGroup(index) {
        this.setState(() => ({
            focusedDistanceGroupIndex: index,
        }))
    }

    removeFocusFromDistanceGroup() {
        this.setState(() => ({
            focusedDistanceGroupIndex: null,
        }))
    }

    setShownMap(event) {
        this.setState(() => ({
            shownMap: event.target.value
        }))
    }

    handleClickOnMetricsButton() {
        this.setState((state) => ({
            metricsDrawerOpen: !state.metricsDrawerOpen
        }))
    }

    render() {
        return (
            <div className="detailed-viz">
                <HeaderForDetailedVisualization
                    storage={this.props.storage}
                    clusterName={this.clusterName}
                    handleClickOnMetricsButton={this.handleClickOnMetricsButton.bind(this)}
                />
                <div className="detailed-viz__body">
                    <div className="detailed-viz__body__map-div">
                        { this.showMap() }
                    </div>
                    { this.state.metricsDrawerOpen &&
                        <div className="detailed-viz__body__metrics-div">
                            <div className="detailed-viz__body__metrics__histogram-div">
                                <h4>Taxi Ride Distance (km)</h4>
                                <BarChart width={300} height={170} data={this.taxiRideDistanceHistData} >
                                    <Bar dataKey="value" onMouseLeave={this.removeFocusFromDistanceGroup.bind(this)}>
                                        {this.taxiRideDistanceHistData.map((elem, index) => (
                                            <Cell
                                                fill={this.colorGradientArray[index]}
                                                key={elem.key}
                                                onMouseEnter={() => this.putFocusOnDistanceGroup(index)}
                                                />
                                        ))}
                                    </Bar>
                                    <XAxis height={60} textAnchor="end" dataKey="key" angle={-90} interval={0} />
                                </BarChart>
                            </div>

                            <div className="detailed-viz__body__metrics__histogram-div">
                                <h4>Taxi Ride Duration (min)</h4>
                                <BarChart width={300} height={180} data={this.taxiRideDurationHistData}>
                                    <Bar dataKey="value">
                                        {this.taxiRideDurationHistData.map((elem) => (
                                            <Cell fill="rgb(77,208,215)" key={elem.key}/>
                                        ))}
                                    </Bar>
                                    <XAxis height={100} textAnchor="end" dataKey="key" angle={-90} interval={0} />
                                </BarChart>
                            </div>

                            <div className="detailed-viz__body__metrics__histogram-div">
                                <h4>Productive Age / Non-productive Age</h4>
                                <PieChart width={300} height={175} data={this.pieChartData}>
                                    <Pie dataKey="value" data={this.pieChartData} fill="blue" isAnimationActive={false} label startAngle={90} endAngle={-270}>
                                        {this.pieChartData.map((elem, index) => (
                                            <Cell key={"cell=" + {index}} fill={this.pieChartColors[index]} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                </PieChart>
                            </div>
                        </div>
                    }
                </div>
            </div>
        )
    }
}