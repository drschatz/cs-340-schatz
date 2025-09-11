import Link from "next/link";

const ResourcePage = () => {
  return (
    <div className="mb-20">
      <div className="mb-8 text-center relative w-full h-[24vh] bg-teal-500">
        <div className="w-full z-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <h1 className="inline-block mt-6 font-semibold capitalize text-light text-2xl md:text-3xl lg:text-5xl !leading-normal relative w-5/6">
            Resources
          </h1>
        </div>
        <div className="absolute top-0 left-0 right-0 bottom-0 h-full bg-amber/60 dark:bg-amber/40" />
      </div>

      <div className="container mx-auto px-4">
      <div className="flex flex-col justify-center items-center">

      <Link
            href="https://docs.google.com/document/d/1K8BdC_cyoVXLQyr_lNuQC9PRlabRO0tOZ4SE9egDmVI/edit?usp=sharing"
          >
            <div className="mb-4 border-4 border-yellow-500 rounded-lg shadow-sm w-80 h-30 flex-shrink-0 hover:shadow-lg transition-shadow duration-300">
              <div className="flex flex-col justify-center p-6">
                <h3 className="text-xl font-semibold text-center">
                  Extra Practice Problems
                </h3>
                <hr className="border-gray/70 my-2" />

              </div>
            </div>
          </Link>

      <Link
            href="/course-book/resource/Setup"
          >
            <div className="mb-4 border-4 border-blue-500 rounded-lg shadow-sm w-80 h-30 flex-shrink-0 hover:shadow-lg transition-shadow duration-300">
              <div className="flex flex-col justify-center p-6">
                <h3 className="text-xl font-semibold text-center">
                  Setting Up Your Local Enviornment
                </h3>
                <hr className="border-gray/70 my-2" />

              </div>
            </div>
          </Link>

          <Link
            href="/course-book/resource/Workspaces"
          >
            <div className="mb-4 border-4 border-blue-500 rounded-lg shadow-sm w-80 h-30 flex-shrink-0 hover:shadow-lg transition-shadow duration-300">
              <div className="flex flex-col justify-center p-6">
                <h3 className="text-xl font-semibold text-center">
                  Priarie Learn Workspaces
                </h3>
                <hr className="border-gray/70 my-2" />

              </div>
            </div>
          </Link>

          <Link
            href="/course-book/resource/RMEs"
          >
            <div className="mb-4 border-4 border-blue-500 rounded-lg shadow-sm w-80 h-30 flex-shrink-0 hover:shadow-lg transition-shadow duration-300">
              <div className="flex flex-col justify-center p-6">
                <h3 className="text-xl font-semibold text-center">RMEs</h3>
                <hr className="border-gray/70 my-2" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="hidden sm:block w-1/12"></div>
    </div>
  );
};

export default ResourcePage;
