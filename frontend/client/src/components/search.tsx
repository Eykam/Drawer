import Icons from "./Icons";
import { Input } from "./ui/input";

export default function Search() {
  return (
    <div className="relative flex-1">
      <Icons.SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search files..."
        className="pl-10 w-full rounded-md bg-muted focus:bg-background"
      />
    </div>
  );
}
