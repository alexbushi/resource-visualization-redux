// Slice of our store
import moment from 'moment';
import { createSlice } from "@reduxjs/toolkit";
//import { createSelector } from 'reselect';
import { apiCallBegan } from './middleware/networkCallActions';
import { url, cacheValidTime } from '../constants';

////////////////////////////////////////////////////////////////////////////////
// Reducer (creates an action also)
////////////////////////////////////////////////////////////////////////////////

const slice = createSlice({
    name: "resources",
    initialState: {
        list: [],
        loading: false,
        lastFetch: null
    },
    reducers: {
        resourcesRequestFailed: (resources, action) => {
            resources.loading = false;
        },
        resourcesRequested: (resources, action) => {
            resources.loading = true;
        },
        resourcesReceived: (resources, action) => {
            resources.list = constructResources(action.payload);
            resources.loading = false;
            resources.lastFetch = Date.now();
        },
    }
});

const constructResources = payload => {

    const peerConnectedEvsesList = payload.evses_log.filter(evse => evse.peer_connected === "true" && evse.vin !== "");
    console.log("Length:", peerConnectedEvsesList.length);

    const resourceList = peerConnectedEvsesList.map(evse => {
        const ev = payload.cars_log.find(car => car.car_name === evse.car_name);
        return {
            evse_id: evse.evse_id,
            vin: ev.vin,
            evse_name: evse.name,
            ev_name: ev.car_name,
            resource_status: ev.primary_status,
            soc: ev.soc,
            real_power: evse.power_flow_real_kw,
            power_capacity: ev.power_capacity_up
        }
    });
    console.log(resourceList);

    return resourceList;
}

const {
    resourcesRequestFailed, 
    resourcesRequested, 
    resourcesReceived, 
} = slice.actions;

export default slice.reducer;

////////////////////////////////////////////////////////////////////////////////
// Action Creators
////////////////////////////////////////////////////////////////////////////////

export const loadResources = () => (dispatch, getState) => {
    const { lastFetch } = getState().entities.resources;

    const diffInMinutes = moment().diff(moment(lastFetch), 'minutes');
    if (diffInMinutes < cacheValidTime ) return;

    return dispatch(
        apiCallBegan({
        url,
        onStart: resourcesRequested.type,
        onSuccess: resourcesReceived.type,
        onError: resourcesRequestFailed.type
        })
    );
};

////////////////////////////////////////////////////////////////////////////////
// Selectors
////////////////////////////////////////////////////////////////////////////////

// Selector function using a cache
// export const selectBugsByUser = userId => createSelector(
//     state => state.entities.bugs.list,
//     list => list.filter(bug => bug.userId === userId)
// );