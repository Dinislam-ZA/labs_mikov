import Form from "next/form";

const QueryForm = ({
  initM1,
  initM2,
  initM3,
}: {
  initM1: number;
  initM2: number;
  initM3: number;
}) => {
  return (
    <Form action="" className="mb-6 flex gap-4">
      <div>
        <label className="block mb-1 text-sm font-semibold">M1 (сталь):</label>
        <input
          type="number"
          name="m1"
          defaultValue={initM1}
          className="border px-4 py-2 rounded"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-semibold">M2 (чугун):</label>
        <input
          type="number"
          name="m2"
          defaultValue={initM2}
          className="border px-4 py-2 rounded"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-semibold">M3 (железо):</label>
        <input
          type="number"
          name="m3"
          defaultValue={initM3}
          className="border px-4 py-2 rounded"
        />
      </div>

      <button
        type="submit"
        className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded self-end"
      >
        Пересчитать
      </button>
    </Form>
  );
};

export default QueryForm;
