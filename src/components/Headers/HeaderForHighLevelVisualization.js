import {Component, React} from "react";
import {Button} from "@mui/material";
import {Link as RouterLink} from "react-router-dom";
import "./HeaderStyles.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars} from "@fortawesome/free-solid-svg-icons";

// The header component for the high-level visualization page
export class HeaderForHighLevelVisualization extends Component {
    render() {
        return (
            <div className="header-component">
                <div className="header-component_header">
                    <h2>High-level visualization ({this.props.jobName})</h2>
                </div>
                <div className="header-component_buttons">
                    {/* when the back button is clicked, user is redirected to the job overview page*/}
                    <Button component={RouterLink} to={this.props.back} className="header-component_buttons_back-button" variant="outlined">Back</Button>

                    <Button
                        style={{padding: "5 8", minWidth: 32}}
                        variant={"outlined"}
                        onClick={this.props.handleClickOnMetricsButton} // details tab is opened
                    >
                        <span style={{marginRight: 8}}>Details </span>
                        {/* hamburger icon */}
                        <FontAwesomeIcon icon={faBars}/>
                    </Button>
                </div>
            </div>
        )
    }
}