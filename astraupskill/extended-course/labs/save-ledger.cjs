// Educational result-ownership model; does not execute React or any API.
'use strict';
function initial() { return { latest: 0, committed: 0, status: 'idle' }; }
function edit(state) { return { ...state, latest: state.latest + 1, status: 'queued' }; }
function settle(state, id, result) {
 const committed = result.status === 'saved' ? result.version : state.committed;
 return { ...state, committed, status: id === state.latest ? result.status : state.status };
}
module.exports = { initial, edit, settle };
