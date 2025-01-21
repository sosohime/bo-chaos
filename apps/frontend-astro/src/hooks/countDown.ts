import { useRef, useState, useEffect } from 'react'
import dayjs from 'dayjs'
import durationPlugin from 'dayjs/plugin/duration'

dayjs.extend(durationPlugin)

function completeToTargetDigits(number: number | string, digits = 2) {
    return String(number).padStart(2, '0')
}

export function getCountDown(tuixiu: dayjs.Dayjs): string {
    const now = dayjs()

    const diff = tuixiu.diff(now);
    const duration = dayjs.duration(diff)
    const days = duration.asDays();
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    const milliseconds = duration.milliseconds()
    return `${Math.floor(days)} 天 ${completeToTargetDigits(hours)}:${completeToTargetDigits(minutes)}:${completeToTargetDigits(seconds)}:${completeToTargetDigits(milliseconds, 3)}`

}

export function useTuixiuCountDown(tuixiu: dayjs.Dayjs) {
    const [countDown, setCountDown] = useState<string>()
    const timer = useRef<NodeJS.Timeout>(null)

    useEffect(() => {
        timer.current = setInterval(() => {
            setCountDown(getCountDown(tuixiu))
        }, 16)

        return () => {
            clearInterval(timer.current!)
        }
    }, [])

    return countDown
}