import { useLocalSearchParams } from "expo-router";
import ProvidersScreen from "@/components/categories/ProvidersScreen";
import ServicesScreen from "@/components/categories/ServicesScreen";
import ProductsScreen from "@/components/categories/ProductsScreen";
import FoodScreen from "@/components/categories/FoodScreen";
import EmergencyScreen from "@/components/categories/EmergencyScreen";
import RealEstateScreen from "@/components/categories/RealEstateScreen";
import AutomobilesScreen from "@/components/categories/AutomobilesScreen";
import JobsScreen from "@/components/categories/JobsScreen";
import EventsScreen from "@/components/categories/EventsScreen";

const SCREENS: Record<string, React.ComponentType> = {
  providers: ProvidersScreen,
  services: ServicesScreen,
  products: ProductsScreen,
  food: FoodScreen,
  emergency: EmergencyScreen,
  realestate: RealEstateScreen,
  automobiles: AutomobilesScreen,
  jobs: JobsScreen,
  events: EventsScreen,
};

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const Screen = SCREENS[id ?? ""] ?? ProvidersScreen;
  return <Screen />;
}
