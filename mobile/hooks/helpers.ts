function formatSeconds(duration: number | null | undefined) {
    if (
        duration == null ||
        Number.isNaN(duration) ||
        !Number.isFinite(duration)
    ) {
        return '--:--.---';
    }
    const { hours, minutes, seconds, milliseconds } =
        extractDurationFromDurationInMs(duration * 1000);
    const fractions: number[] = [minutes, seconds];
    if (hours) fractions.unshift(hours);
    return [
        fractions.map((number) => number.toString().padStart(2, '0')).join(':'),
        milliseconds.toString().padStart(3, '0')
    ].join('.');
}

function extractDurationFromDurationInMs(durationInMs: number) {
    if (!Number.isFinite(durationInMs) || durationInMs < 0) {
        throw new Error(`${durationInMs} isn't a valid duration`);
    }

    const milliseconds = Math.floor(durationInMs % 1000);
    let seconds = Math.floor(durationInMs / 1000);
    let minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;

    return {
        hours,
        minutes,
        seconds,
        milliseconds
    };
}

export { formatSeconds, extractDurationFromDurationInMs };
