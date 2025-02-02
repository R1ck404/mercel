const toFormattedDate = (time: string): string => {
    if (!time) {
        return "";
    }

    const date = new Date(time);
    return date.toLocaleDateString();
};

const formatTimestamp = (isoTimestamp: string): string => {
    const date = new Date(isoTimestamp);

    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');

    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
};

const formatTimestampLong = (isoTimestamp: string): string => {
    const date = new Date(isoTimestamp);

    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const month = monthNames[date.getUTCMonth()];
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours();
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');
    const period = hours >= 12 ? 'PM' : 'AM';

    const formattedHours = hours % 12 || 12;

    return `${month} ${day}, ${year}, ${formattedHours}:${minutes}:${seconds}.${milliseconds} ${period}`;
};

const getNumericTimestamp = (isoTimestamp: string): number => {
    const date = new Date(isoTimestamp);
    if (isNaN(date.getTime())) {
        console.error("Invalid timestamp:", isoTimestamp);
        return 0;
    }
    return date.getTime();
};

const formatRelativeTime = (milliseconds: number): string => {
    if (milliseconds < 1000) {
        return `${milliseconds}ms`;
    } else if (milliseconds < 60000) {
        return `${Math.floor(milliseconds / 1000)}s`;
    } else {
        return `${Math.floor(milliseconds / 60000)}min`;
    }
};

const formatRelativeTimePrecise = (milliseconds: number): string => {
    if (milliseconds < 1000) {
        return `${milliseconds}ms`;
    } else {
        return `${(milliseconds / 1000).toFixed(1)}s`;
    }
};

const toUTC = (date: Date): string => {
    return date.toISOString();
};

const toLocalTime = (date: Date): string => {
    return date.toLocaleString();
};

const calculateTimeDifference = (startTime: string, endTime: string): string => {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    let diff = endDate.getTime() - startDate.getTime();

    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    diff -= years * (1000 * 60 * 60 * 24 * 365);

    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    diff -= months * (1000 * 60 * 60 * 24 * 30);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);

    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);

    const seconds = Math.floor(diff / 1000);
    diff -= seconds * 1000;

    const milliseconds = diff;

    const result = [];

    if (years > 0) {
        result.push(`${years} year${years === 1 ? '' : 's'}`);
    }
    if (months > 0) {
        result.push(`${months} month${months === 1 ? '' : 's'}`);
    }
    if (days > 0) {
        result.push(`${days} day${days === 1 ? '' : 's'}`);
    }
    if (hours > 0) {
        result.push(`${hours} hour${hours === 1 ? '' : 's'}`);
    }
    if (minutes > 0 && result.length === 0) {
        result.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
    }
    if (seconds > 0 && result.length === 0) {
        result.push(`${seconds} second${seconds === 1 ? '' : 's'}`);
    }
    if (milliseconds > 0 && result.length === 0) {
        result.push(`${milliseconds} millisecond${milliseconds === 1 ? '' : 's'}`);
    }

    return result.length > 0 ? `${result.join(', ')} ago` : 'just now';
};

const formatDateTimeArray = (isoTimestamp: string): [string, string] => {
    const date = new Date(isoTimestamp);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';

    const formattedHours = hours % 12 || 12;

    const dateString = `${month} ${day}, ${year}`;
    const timeString = `${formattedHours}:${minutes}:${seconds} ${period}`;

    return [dateString, timeString];
};

const formatToDate = (isoTimestamp: string): string => {
    const date = new Date(isoTimestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const formatToTime = (isoTimestamp: string, timeZone: 'UTC' | 'local' = 'local'): string => {
    const date = new Date(isoTimestamp);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: timeZone === 'UTC' ? 'UTC' : undefined,
    });
};

const getTimeZone = (): string => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone) {
        return timeZone;
    }

    const offset = -new Date().getTimezoneOffset() / 60;
    return `GMT${offset >= 0 ? '+' : ''}${offset}`;
};

export {
    toFormattedDate,
    formatTimestamp,
    getNumericTimestamp,
    formatRelativeTime,
    formatRelativeTimePrecise,
    toUTC,
    toLocalTime,
    calculateTimeDifference,
    formatDateTimeArray,
    formatTimestampLong,
    formatToDate,
    formatToTime,
    getTimeZone
};