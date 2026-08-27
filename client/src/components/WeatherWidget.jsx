import { useEffect, useState } from 'react'

function formatLondonTime() {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date())
}

function WeatherWidget() {
  const [londonTime, setLondonTime] = useState(formatLondonTime)
  const [weatherTheme, setWeatherTheme] = useState('weather-default')

  useEffect(() => {
    const timer = setInterval(() => {
      setLondonTime(formatLondonTime())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const weatherThemes = {
      clear: 'weather-clear',
      partlyCloudy: 'weather-cloudy',
      cloudy: 'weather-cloudy',
      fog: 'weather-fog',
      rain: 'weather-rain',
      snow: 'weather-snow',
      thunder: 'weather-thunder',
      unknown: 'weather-default',
    }

    const getThemeFromCode = (code) => {
      if (code === 0) return weatherThemes.clear
      if ([1, 2].includes(code)) return weatherThemes.partlyCloudy
      if (code === 3) return weatherThemes.cloudy
      if ([45, 48].includes(code)) return weatherThemes.fog
      if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return weatherThemes.rain
      }
      if ([71, 73, 75, 77, 85, 86].includes(code)) return weatherThemes.snow
      if ([95, 96, 99].includes(code)) return weatherThemes.thunder
      return weatherThemes.unknown
    }

    const loadWeather = async () => {
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=51.5072&longitude=-0.1276&current=weather_code&timezone=Europe%2FLondon',
      )

      if (!response.ok) throw new Error(`Weather request failed: ${response.status}`)

      const data = await response.json()
      const weatherCode = data?.current?.weather_code
      if (typeof weatherCode !== 'number') throw new Error('Weather response missing weather code')

      setWeatherTheme(getThemeFromCode(weatherCode))
    }

    loadWeather().catch((error) => {
      setWeatherTheme('weather-default')
      console.error(error)
    })

    const weatherTimer = setInterval(() => {
      loadWeather().catch((error) => {
        setWeatherTheme('weather-default')
        console.error(error)
      })
    }, 60 * 1000)

    return () => clearInterval(weatherTimer)
  }, [])

  return (
    <fieldset className={`side-box box my-time ${weatherTheme}`}>
      <p>{londonTime}</p>
    </fieldset>
  )
}

export default WeatherWidget
