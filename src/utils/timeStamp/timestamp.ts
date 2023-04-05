function convertTimeTo12Hour(timeStr) {
  // Split the time string into hours and minutes
  const [hours, minutes] = timeStr.split(':');

  // Convert hours and minutes to integers
  const hoursInt = parseInt(hours, 10);
  const minutesInt = parseInt(minutes, 10);

  // Identify AM or PM based on the hour
  let amPm = 'AM';
  if (hoursInt >= 12) {
    amPm = 'PM';
  }
  // Convert hours to 12-hour format
  let hours12: string | number = hoursInt % 12;
  if (hours12 === 0) {
    hours12 = 12;
  }
  if (hours12 < 10) {
    hours12 = `0${hours12}`;
  }

  // Format the time in 12-hour format
  const time12Hour = `${hours12}:${minutesInt
    .toString()
    .padStart(2, '0')} ${amPm}`;
  return time12Hour;
}
export default convertTimeTo12Hour;
