import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export const FakeDataSchema = z.object({
  id: z.number().nonnegative(),
  title: z.string().min(2),
  completed: z.boolean().nonoptional(),
});

export type fakeDataProps = z.infer<typeof FakeDataSchema>;

export const fakeData: fakeDataProps[] = [
  {
    id: 1,
    title: "Home Work",
    completed: false,
  },
];

export const fakeDataIdSchema = z.number().nonnegative();

export const getTodos = createServerFn({ method: "GET" }).handler(async () => {
  return [...fakeData];
});

export const postNewTodo = createServerFn({ method: "POST" })
  .inputValidator(FakeDataSchema)
  .handler(async ({ data }) => {
    const exiestID = fakeData.some((todo) => todo.id == data.id);
    if (exiestID) return { message: "the ID is already exiest" };
    fakeData.push(data);
    return { message: "New todo added" };
  });

export const deleteTodo = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.number(),
    })
  )
  .handler(async ({ data }) => {
    const index = fakeData.findIndex((todo) => todo.id === data.id);
    if (index > -1) {
      fakeData.splice(index, 1);
    }
    return { message: "The task is deleted" };
  });

export const completedTodos = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.number(),
    })
  )
  .handler(async ({ data }) => {
    const todo = fakeData.find((t) => t.id === data.id)!;
    if (todo) {
      todo.completed = !todo.completed;
      return { message: "Update the work" };
    }
    throw new Error("Todo not found");
  });

export const Route = createFileRoute("/server/")({
  component: RouteComponent,
});

function RouteComponent() {
  const form = useForm({
    defaultValues: {
      title: "",
    },
    validators: {
      onChange: z.object({
        title: z.string().min(2, "Title is too short"),
      }),
    },
    onSubmit: async ({ value }) => {
      const newTodo: fakeDataProps = {
        id: Math.floor(Math.random() * 9999999999),
        title: value.title,
        completed: false,
      };
      try {
        const result = await postNewTodo({ data: newTodo });
        console.log(result.message, value);
        form.reset();
      } catch (err) {
        console.error("Failed to post:", err);
      }
    },
  });
  return (
    <div className="w-full flex items-center justify-center">
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Add New Todo</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            id="bug-report-form"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field
                name="title"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Todo title</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Todo title"
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  form="bug-report-form"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Submit"}
                </Button>
              )}
            />
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
}
