/**
 * PopoverTooltipHover.js
 * 
 * This is a resuable "widget" that acts as tooltip.
 * 
 * Requires the prop attributes "header","formalDef", and "info" which will become more generic in the future.
 * 
 * @author Alex Diviney
 */


import { OverlayTrigger, Tooltip, Popover, Button } from 'react-bootstrap';
import { SvgIcon } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useEffect, useContext } from 'react';
import { ProblemContext } from '../contexts/ProblemProvider';
import { getThemeProps } from '@mui/system';

function popOver(props) {
  return (
    <Popover id="popover-basic" className="tooltip">
      <Popover.Header as="h3">
        {props.toolTip.header}
      </Popover.Header>
      <Popover.Body>
        {props.toolTip.formalDef && (
          <>
            {props.toolTip.formalDef}
            <br></br>
            <br></br>
          </>
        )}
        {props.toolTip.info && (
          <>
            {props.toolTip.info}
            <br></br>
            <br></br>
          </>
        )}
        {props.toolTip.source && (
          <>
            {props.toolTip.source}
            <br></br>
            <br></br>
          </>
        )}
        {props.toolTip.credit && (
          <>
            {props.toolTip.credit}
            <br></br>
            <br></br>
          </>
        )}
      </Popover.Body>
    </Popover>
  );

}

function PopoverTooltipClick(props) {


  return (
    <OverlayTrigger rootClose={true} trigger="click" placement="bottom" overlay={popOver(props)} >
      <InfoOutlinedIcon>
        <Button variant="success">
        </Button>
      </InfoOutlinedIcon>
    </OverlayTrigger>
  )
}

export default PopoverTooltipClick;

