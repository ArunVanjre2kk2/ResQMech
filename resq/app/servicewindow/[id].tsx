// app/servicewindow/[id].tsx

import { useLocalSearchParams } from "expo-router";

import FlatTyreWindow from "../../components/flattyrewindow";
import PunctureWindow from "../../components/puncturewindow";
import BatteryWindow from "../../components/batterywindow";
import FuelWindow from "../../components/fuelwindow";
import KeyWindow from "../../components/keywindow";

import MinorWindow from "../../components/minorwindow";
import BrakeWindow from "../../components/brakewindow";
import StartingWindow from "../../components/startingwindow";
import EngineWindow from "../../components/enginewindow";
import TowingWindow from "../../components/towingwindow";
// import VideoCallWindow from "../../components/VideoCallWindow";

export default function ServiceWindow() {
  const { id } = useLocalSearchParams();
  const serviceId = Number(id);

  switch (serviceId) {
    case 1:
      return <FlatTyreWindow />;
    case 2:
      return <PunctureWindow />;
    case 3:
      return <BatteryWindow />;
    case 4:
      return <KeyWindow />;
    case 5:
      return <FuelWindow />;

    case 6:
      return <MinorWindow />;
    case 7:
      return <BrakeWindow />;
    case 8:
      return <StartingWindow />;
    case 9:
      return <EngineWindow />;
    case 10:
      return <TowingWindow />;
    // case 11:
    //   return <VideoCallWindow />;

    default:
      return null;
  }
}
