import * as abc from 'abcjs'
import { useEffect, useRef } from 'react'
import 'abcjs/abcjs-audio.css'

export function Partiture(props: {
	sectionRef: React.RefObject<HTMLDivElement>
	synthControlRef: React.MutableRefObject<abc.SynthObjectController | undefined>
}) {
	const synthControlRef = useRef<abc.SynthObjectController>()

	useEffect(() => {
		if (abc.synth.supportsAudio()) {
			const synthControl = new abc.synth.SynthController()
			const cursorControl = {}

			synthControl.load('#audio', cursorControl, {
				displayLoop: true,
				displayRestart: true,
				displayPlay: true,
				displayProgress: true,
				displayWarp: true,
			})
			synthControlRef.current = synthControl
		}
	}, [])

	return (
		<>
			<div ref={props.sectionRef} />
			<div id='audio' />
		</>
	)
}

export default Partiture
