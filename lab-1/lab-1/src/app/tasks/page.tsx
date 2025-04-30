import QueryTable from "./components/QueryTable";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div>
      <QueryTable searchParams={searchParams} />
    </div>
  );
}
