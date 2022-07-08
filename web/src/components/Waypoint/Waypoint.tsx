import { IntersectionOptions, useInView } from 'react-intersection-observer';

export type WaypointProps = IntersectionOptions;

const Waypoint = (props: WaypointProps) => {
  const { ref } = useInView(props);

  return <div ref={ref} />;
};

export default Waypoint;
