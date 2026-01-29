import { useForm } from "@tanstack/react-form-start";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";

const validateTodo = z.object({
  title: z.string().min(3, "Todo title must be 3 char atleast"),
});

export const fakeDBSchema = z.object({
  id: z.number().nonnegative(),
  title: z.string().min(3, "Todo title must be 3 char atleast").nonoptional(),
  isCompleted: z.boolean().default(false),
});
export type fakeDBProps = z.infer<typeof fakeDBSchema>;

const fakeDB: fakeDBProps[] = [
  {
    id: 1,
    title: "1st todo",
    isCompleted: false,
  },
];

export const postTodo = createServerFn({ method: "POST" })
  .inputValidator(validateTodo)
  .handler(async ({ data }) => {
    const newData = {
      id: Date.now(),
      title: data.title,
      isCompleted: false,
    };
    fakeDB.push(newData);
    return { message: "New todo added", status: 200, ok: true };
  });

export const getTodos = createServerFn().handler(async () => {
  return fakeDB;
});

export const Route = createFileRoute("/server/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      title: "",
    },
    validators: {
      onSubmit: validateTodo,
    },
    onSubmit: async ({ value }) => {
      const res = await postTodo({
        data: {
          title: value.title,
        },
      });
      if (res.ok) {
        await router.invalidate();
        navigate({ to: "/server/result" });
      }
      console.log("form submited", value);
    },
  });
  return (
    <div className="flex items-center justify-center w-full">
      <form
        onSubmit={(e) => {
          (e.preventDefault(), e.stopPropagation(), form.handleSubmit());
        }}
      >
        <form.Field
          name="title"
          children={(field) => (
            <div>
              <input
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="border border-red-300"
              />
              {field.state.meta.errors.length > 0 && (
                <span style={{ color: "red" }}>
                  {field.state.meta.errors[0]?.message}
                </span>
              )}
              <button type="submit">submit</button>
            </div>
          )}
        />
      </form>
    </div>
  );
}
