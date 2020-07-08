import {MDCRipple} from '@material/ripple/index';
const foo_button = new MDCRipple(document.querySelector('.foo-button'));
const compute_button = new MDCRipple(document.querySelector('.compute-button'));

import {MDCTextField} from '@material/textfield';

const input_mass = new MDCTextField(document.querySelector('.input_mass'));
const input_radius = new MDCTextField(document.querySelector('.input_radius'));
const input_period = new MDCTextField(document.querySelector('.input_period'));
const input_k = new MDCTextField(document.querySelector('.input_k'));
const input_eccentricity = new MDCTextField(document.querySelector('.input_eccentricity'));
const input_mass_error = new MDCTextField(document.querySelector('.input_mass_error'));
const input_radius_error = new MDCTextField(document.querySelector('.input_radius_error'));
const input_period_error = new MDCTextField(document.querySelector('.input_period_error'));
const input_k_error = new MDCTextField(document.querySelector('.input_k_error'));
const input_eccentricity_error = new MDCTextField(document.querySelector('.input_eccentricity_error'));