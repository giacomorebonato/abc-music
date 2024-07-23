import * as abc from 'abcjs'
import { useRef, useState } from 'react'
import 'abcjs/abcjs-audio.css'
import type { DebouncedFunction } from 'debounce'

export function Partiture(props: {
	sectionRef: React.RefObject<HTMLDivElement>
	synthControlRef: React.MutableRefObject<abc.SynthObjectController | undefined>
	updateMusic: DebouncedFunction<() => Promise<void>>
	tempo: number
}) {
	const synthControlRef = useRef<abc.SynthObjectController>()
	const [controlsLoaded, setControlsLoaded] = useState(false)

	return (
		<>
			<div ref={props.sectionRef} />

			<div id='audio' />

			{!controlsLoaded && (
				<button
					className='btn btn-sm btn-block btn-primary'
					type='button'
					onClick={() => {
						window.createSynth = new abc.synth.CreateSynth()
						window.synthControl = new abc.synth.SynthController()

						window.synthControl.load(
							'#audio',
							{},
							{
								displayLoop: true,
								displayRestart: true,
								displayPlay: true,
								displayProgress: true,
								displayWarp: true,
							},
						)

						synthControlRef.current = window.synthControl
						setControlsLoaded(true)

						props.updateMusic()

						const tempoInput = document.querySelector<HTMLInputElement>(
							'input.abcjs-midi-tempo',
						)

						if (tempoInput) {
							tempoInput.value = props.tempo.toString()
						}
					}}
				>
					Load controls
				</button>
			)}
		</>
	)
}

export default Partiture
