/**
 * Defines the base URL for the API.
 * The default values is overridden by the `API_BASE_URL` environment variable.
 */
import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-date";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

/**
 * Defines the default headers for these functions to work with `json-server`
 */
const headers = new Headers();
headers.append("Content-Type", "application/json");

/**
 * Fetch `json` from the specified URL and handle error status codes and ignore `AbortError`s
 *
 * This function is NOT exported because it is not needed outside of this file.
 *
 * @param url
 *  the url for the requst.
 * @param options
 *  any options for fetch
 * @param onCancel
 *  value to return if fetch call is aborted. Default value is undefined.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the `json` data or an error.
 *  If the response is not in the 200 - 399 range the promise is rejected.
 */
async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) {
      return null;
    }

    const payload = await response.json();

    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}

/**
 * Retrieves all existing reservation.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservation saved in the database.
 */
// Params being url params, such as ?date=SOMETHING
export async function listReservations(params, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value.toString())
  );
  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
}

/**
 * Retrieves all existing tables.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of tables saved in the database.
 */
export async function listTables(signal) {
  const url = new URL(`${API_BASE_URL}/tables`);
  const options = {
    method: "GET",
    headers,
    signal,
  };
  return await fetchJson(url, options, [])
}

/**
 * Creates a new reservation
 * @returns {Promise<{reservation}>}
 *  a promise that resolves to the newly created reservation.
 */
export async function createReservation(newReservation, signal) {
  const url = `${API_BASE_URL}/reservations`;
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: newReservation }),
    signal,
  };
  await fetchJson(url, options);
  return "seated"
}


/**
 * Creates a new table
 * @returns {Promise<{reservation}>}
 *  a promise that resolves to the newly created table.
 */
export async function createTable(newTable, signal) {
  const url = `${API_BASE_URL}/tables`;
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: newTable }),
    signal,
  };
  return await fetchJson(url, options);
}

/**
 * Retrieves a specific reservation based on ID.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a object of one reservation saved in the database.
 */

export async function readReservations(id, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${id}`);
  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
}

/**
 * Seats a table, at a specified table
 * @returns {Promise<{reservation}>}
 *  a promise that resolves to the newly created table.
 */
export async function seatTable(tableId, reservationId, signal) {
  const url = `${API_BASE_URL}/tables/${tableId}/seat`;
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: {reservation_id: reservationId} }),
    signal,
  };
  // seating a table doesnt send any response back from DB
  return await fetchJson(url, options);
}

/**
 * Clears a table, at a specified table
 * @returns {Promise<{reservation}>}
 *  a promise that sets a status on table to clear, and reservation on it to finished table.
 */
export async function clearTable(tableId, signal) {
  const url = `${API_BASE_URL}/tables/${tableId}/seat`;
  const options = {
    method: "DELETE",
    headers,
    signal,
  };
  // seating a table doesnt send any response back from DB
  return await fetchJson(url, options);
}

/**
 * Retrieves a array of reservations based on phone number.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to an array of reservations saved in the database.
 */

export async function searchReservationsByPhone(phoneNumber, signal) {
  const url = new URL(`${API_BASE_URL}/reservations?mobile_number=${phoneNumber}`);
  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
}


/**
 * Cancels a reservation
 * @returns {Promise<{reservation}>}
 *  a promise that resolves to a specific reservation, with a status of 'cancelled.
 */
export async function cancelReservation(reservationId, signal) {
  const url = `${API_BASE_URL}/reservations/${reservationId}/status`;
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: {status: "cancelled"} }),
    signal,
  };
  // seating a table doesnt send any response back from DB
  return await fetchJson(url, options);
}

/**
 * Edit a reservation
 * @returns {Promise<{reservation}>}
 *  a promise that resolves to the newly edited reservation.
 */
export async function editReservation(reservationId, updatedReservation, signal) {
  const url = `${API_BASE_URL}/reservations/${reservationId}`;
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: updatedReservation }),
    signal,
  };
  // seating a table doesnt send any response back from DB
  return await fetchJson(url, options);
}