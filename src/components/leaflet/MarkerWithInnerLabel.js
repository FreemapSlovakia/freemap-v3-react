import React from 'react';
import { Marker } from 'react-leaflet';

export default function MarkerWithInnerLabel(props) {
  const oneLetterLabel = props.label && props.label.toString().charAt(0);
  const { image, faIcon, faIconLeftPadding, color = '#2981ca' } = props;

  let html = `<?xml version="1.0" encoding="utf-8"?>
    <svg style="enable-background:new 0 0 512 512;" x="0px" y="0px" viewBox="0 0 310 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="gradient-2" gradientUnits="userSpaceOnUse" cx="154.607" cy="160.652" r="131.625" gradientTransform="matrix(0.907588, 0, 0, 0.907588, 13.800331, 17.89466)">
          <stop offset="0" style="stop-color: rgba(255, 255, 255, 1)"/>
          <stop offset="0.799" style="stop-color: rgb(245, 245, 245);"/>
          <stop offset="1" style="stop-color: ${color};"/>
        </radialGradient>
      </defs>
      <path d="M 156.063 11.734 C 74.589 11.734 8.53 79.093 8.53 162.204 C 8.53 185.48 13.716 207.552 22.981 227.212 C 23.5 228.329 156.063 493.239 156.063 493.239 L 287.546 230.504 C 297.804 210.02 303.596 186.803 303.596 162.204 C 303.596 79.093 237.551 11.734 156.063 11.734 Z" style="stroke-width: 10; fill: ${color}; stroke-opacity: 0.5; stroke: white;"/>
      <ellipse cx="154.12" cy="163.702" rx="119.462" ry="119.462" style="stroke-width: 10; stroke-opacity: 0.6; fill: url(#gradient-2);"/>
      ${props.label ? `<text x="103.319" y="227.615" style="fill: rgba(0, 0, 0, 0.682353); font-size: 183.6px; font-weight: bold; white-space: pre; font-family: Sans-Serif">${oneLetterLabel}</text>` : ''}
      ${image ? `<image x="74" y="84" width="160" height="160" xlink:href="${image}">` : ''}
    </svg>`;

  if (faIcon) {
    let leftPadding = faIconLeftPadding || 0;
    html += `<div class="fa-icon-inside-leaflet-icon-holder"><i class="fa fa-${faIcon}" style="color: ${color}; padding-left: ${leftPadding}" /></div>`; 
  }

  const icon = new L.divIcon({
    iconSize: [ 24, 40 ],
    iconAnchor: [ 12, 37 ],
    popupAnchor: [ 0, -34 ],
    html
  });

  return <Marker {...props} icon={icon}/>;
}

MarkerWithInnerLabel.propTypes = {
  ...Marker.propTypes,
  label: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ]),
  color: React.PropTypes.string,
  image: React.PropTypes.string,
  faIcon: React.PropTypes.string,
  faIconLeftPadding: React.PropTypes.string
};
