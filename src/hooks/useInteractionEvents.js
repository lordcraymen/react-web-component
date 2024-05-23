// useInteractionEvents.js
import { useEffect } from 'react';
import { useInteractionEventContext } from '../contexts/InteractionEventContext';
import { EventStore } from '../stores/EventStore';
import { useThree } from '@react-three/fiber';

const useInteractionEvents = (events) => {
  const { domElement } = useThree(state => state.gl);

  useEffect(() => {
    EventStore.initialize(domElement);

    const eventTypes = Object.keys(events);

    eventTypes.forEach(type => {
      const handler = events[type];
      EventStore.addEventListener(type, handler);
    });

    return () => {
      eventTypes.forEach(type => {
        const handler = events[type];
        EventStore.removeEventListener(type, handler);
      });
    };
  }, [events, domElement]);
};

export default useInteractionEvents;
