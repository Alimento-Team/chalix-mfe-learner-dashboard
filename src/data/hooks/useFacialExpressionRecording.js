import { useCallback, useRef, useState } from 'react';
import { uploadFacialExpressionVideo } from '../services/lms/facialExpressionApi';

const RECORDING_DURATION_MS = 10_000;

const PREFERRED_MIME_TYPES = [
  'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
  'video/mp4',
  'video/webm;codecs=vp8,opus',
  'video/webm',
];

const getSupportedMimeType = () => PREFERRED_MIME_TYPES
  .find((mimeType) => window.MediaRecorder && window.MediaRecorder.isTypeSupported(mimeType));

export const useFacialExpressionRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [lastUploadResult, setLastUploadResult] = useState(null);
  const [recordingError, setRecordingError] = useState(null);
  const activeRef = useRef(false);

  const startTenSecondRecording = useCallback(async ({ courseId, unitId, topicId }) => {
    if (!courseId || !unitId || activeRef.current) {
      return null;
    }

    if (!navigator?.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setRecordingError(new Error('Camera recording is not supported in this browser.'));
      return null;
    }

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      setRecordingError(new Error('No supported video recording codec was found.'));
      return null;
    }

    let stream;
    let recorder;

    try {
      activeRef.current = true;
      setRecordingError(null);
      setIsRecording(true);

      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const chunks = [];

      recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      const stopped = new Promise((resolve, reject) => {
        recorder.onerror = (event) => {
          reject(event.error || new Error('Recording error'));
        };

        recorder.onstop = async () => {
          try {
            const mergedBlob = new Blob(chunks, { type: mimeType });
            const uploadFile = new File(
              [mergedBlob],
              `${Date.now()}.mp4`,
              { type: 'video/mp4' },
            );

            const uploadResult = await uploadFacialExpressionVideo({
              videoFile: uploadFile,
              courseId,
              unitId,
              topicId,
              durationSeconds: 10,
              isFinal: true,
              timestamp: new Date().toISOString(),
            });

            setLastUploadResult(uploadResult);
            resolve(uploadResult);
          } catch (error) {
            reject(error);
          }
        };
      });

      recorder.start(250);

      window.setTimeout(() => {
        if (recorder && recorder.state !== 'inactive') {
          recorder.stop();
        }
      }, RECORDING_DURATION_MS);

      return await stopped;
    } catch (error) {
      setRecordingError(error);
      return null;
    } finally {
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      activeRef.current = false;
      setIsRecording(false);
    }
  }, []);

  return {
    isRecording,
    lastUploadResult,
    recordingError,
    startTenSecondRecording,
  };
};

export default {
  useFacialExpressionRecording,
};
