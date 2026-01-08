exports.formatDate = (date) => {
    return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
};

exports.addMinutes = (date, minutes) => {
    return new Date(date.getTime() + minutes * 60000);
};
