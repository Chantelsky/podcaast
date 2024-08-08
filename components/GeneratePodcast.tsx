import { Dispatch, SetStateAction, useState } from 'react'
import { Id } from '@/convex/_generated/dataModel'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Loader } from 'lucide-react'
import { useAction, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { v4 as uuidv4 } from 'uuid'
import { useUploadFiles } from '@xixixao/uploadstuff/react'
import { useToast } from './ui/use-toast'

export interface GeneratePodcastProps {
  voiceType: string
  setAudio: Dispatch<SetStateAction<string>>
  audio: string
  setAudioStorageId: Dispatch<SetStateAction<Id<'_storage'> | null>>
  voicePrompt: string
  setVoicePrompt: Dispatch<SetStateAction<string>>
  setAudioDuration: Dispatch<SetStateAction<number>>
}

//* NOTE: due to having a free account, the audio is not being generated
// todo: extract out to own file to make the component more readable
const useGeneratePodcast = ({
  setAudio,
  voiceType,
  voicePrompt,
  setAudioStorageId,
}: GeneratePodcastProps) => {
  const [isGenerating, setisGenerating] = useState(false)
  const { toast } = useToast()
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const { startUpload } = useUploadFiles(generateUploadUrl)

  const getPodcastAudio = useAction(api.openai.generateAudioAction)
  const getAudioUrl = useMutation(api.podcasts.getUrl)
  const generatePodcast = async () => {
    setisGenerating(true)
    setAudio('')

    if (!voicePrompt) {
      toast({
        title: 'Please provide a prompt to generate audio',
      })
      setisGenerating(false)
      return
    }

    try {
      const response = await getPodcastAudio({
        voice: voiceType,
        input: voicePrompt,
      })
      const blob = new Blob([response], { type: 'audio/mpeg' })
      const fileName = `podcast-${uuidv4()}.mp3`
      const file = new File([blob], fileName, { type: 'audio/mpeg' })

      const uploaded = await startUpload([file])
      const storageId = (uploaded[0] as any).storageId

      setAudioStorageId(storageId)
      const audioUrl = await getAudioUrl({ storageId })
      setAudio(audioUrl!)
      setisGenerating(false)
      toast({
        title: 'Podcast audio generated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error generating Audio',
        variant: 'destructive',
      })
      console.error(error)
      setisGenerating(false)
    }
  }
  return {
    isGenerating,
    generatePodcast,
  }
}

const GeneratePodcast = (props: GeneratePodcastProps) => {
  const { isGenerating, generatePodcast } = useGeneratePodcast(props)

  return (
    <div>
      <div className='flex flex-col gap-2.5'>
        <Label className='text-16 font-bold text-white-1'>
          AI Prompt to generate Podcast
        </Label>
        <Textarea
          className='input-class font-light focus-visible:ring-offset-orange-1'
          placeholder='provide text to generate audio'
          rows={5}
          value={props.voicePrompt}
          onChange={(e) => props.setVoicePrompt(e.target.value)}
        />
      </div>
      <div className='mt-5 w-full max-w-[200px]'>
        <Button
          type='submit'
          className='text-16 bg-orange-1 py-4 font-bold text-white-1'
          onClick={generatePodcast}
        >
          {isGenerating ? (
            <>
              Generating
              <Loader size={20} className='animate-spin ml-1' />
            </>
          ) : (
            'Generate'
          )}
        </Button>
      </div>
      {props.audio && (
        <audio
          controls
          src={props.audio}
          autoPlay
          className='mt-5'
          onLoadedMetadata={(e) =>
            props.setAudioDuration(e.currentTarget.duration)
          }
        />
      )}
    </div>
  )
}

export default GeneratePodcast
