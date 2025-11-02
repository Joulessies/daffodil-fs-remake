"use client";

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Heading,
  Text,
  useToast,
  Progress,
  VStack,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminBackButton from "@/components/AdminBackButton";

export default function CMSPageEditor({ page = null }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    content: "",
    image_url: "",
    philosophy_title: "",
    philosophy_card1_title: "",
    philosophy_card1_description: "",
    philosophy_card2_title: "",
    philosophy_card2_description: "",
    philosophy_card3_title: "",
    philosophy_card3_description: "",
    team_title: "",
    team_subtitle: "",
    team_member1_image: "",
    team_member1_name: "",
    team_member1_role: "",
    team_member1_bio: "",
    team_member2_image: "",
    team_member2_name: "",
    team_member2_role: "",
    team_member2_bio: "",
    team_member3_image: "",
    team_member3_name: "",
    team_member3_role: "",
    team_member3_bio: "",
    team_member4_image: "",
    team_member4_name: "",
    team_member4_role: "",
    team_member4_bio: "",
    team_member5_image: "",
    team_member5_name: "",
    team_member5_role: "",
    team_member5_bio: "",
    testimonials_title: "",
    testimonial1_text: "",
    testimonial1_name: "",
    testimonial1_client_type: "",
    testimonial2_text: "",
    testimonial2_name: "",
    testimonial2_client_type: "",
    testimonial3_text: "",
    testimonial3_name: "",
    testimonial3_client_type: "",
    values_title: "",
    value1_icon: "",
    value1_title: "",
    value1_description: "",
    value2_icon: "",
    value2_title: "",
    value2_description: "",
    value3_icon: "",
    value3_title: "",
    value3_description: "",
    value4_icon: "",
    value4_title: "",
    value4_description: "",
    meta_title: "",
    meta_description: "",
    status: "published",
  });
  const toast = useToast();

  useEffect(() => {
    if (page) {
      setFormData({
        slug: page.slug || "",
        title: page.title || "",
        content: page.content || "",
        image_url: page.image_url || "",
        philosophy_title: page.philosophy_data?.title || "",
        philosophy_card1_title: page.philosophy_data?.cards?.[0]?.title || "",
        philosophy_card1_description:
          page.philosophy_data?.cards?.[0]?.description || "",
        philosophy_card2_title: page.philosophy_data?.cards?.[1]?.title || "",
        philosophy_card2_description:
          page.philosophy_data?.cards?.[1]?.description || "",
        philosophy_card3_title: page.philosophy_data?.cards?.[2]?.title || "",
        philosophy_card3_description:
          page.philosophy_data?.cards?.[2]?.description || "",
        team_title: page.team_data?.title || "",
        team_subtitle: page.team_data?.subtitle || "",
        team_member1_image: page.team_data?.members?.[0]?.image_url || "",
        team_member1_name: page.team_data?.members?.[0]?.name || "",
        team_member1_role: page.team_data?.members?.[0]?.role || "",
        team_member1_bio: page.team_data?.members?.[0]?.bio || "",
        team_member2_image: page.team_data?.members?.[1]?.image_url || "",
        team_member2_name: page.team_data?.members?.[1]?.name || "",
        team_member2_role: page.team_data?.members?.[1]?.role || "",
        team_member2_bio: page.team_data?.members?.[1]?.bio || "",
        team_member3_image: page.team_data?.members?.[2]?.image_url || "",
        team_member3_name: page.team_data?.members?.[2]?.name || "",
        team_member3_role: page.team_data?.members?.[2]?.role || "",
        team_member3_bio: page.team_data?.members?.[2]?.bio || "",
        team_member4_image: page.team_data?.members?.[3]?.image_url || "",
        team_member4_name: page.team_data?.members?.[3]?.name || "",
        team_member4_role: page.team_data?.members?.[3]?.role || "",
        team_member4_bio: page.team_data?.members?.[3]?.bio || "",
        team_member5_image: page.team_data?.members?.[4]?.image_url || "",
        team_member5_name: page.team_data?.members?.[4]?.name || "",
        team_member5_role: page.team_data?.members?.[4]?.role || "",
        team_member5_bio: page.team_data?.members?.[4]?.bio || "",
        testimonials_title: page.testimonials_data?.title || "",
        testimonial1_text:
          page.testimonials_data?.testimonials?.[0]?.text || "",
        testimonial1_name:
          page.testimonials_data?.testimonials?.[0]?.name || "",
        testimonial1_client_type:
          page.testimonials_data?.testimonials?.[0]?.client_type || "",
        testimonial2_text:
          page.testimonials_data?.testimonials?.[1]?.text || "",
        testimonial2_name:
          page.testimonials_data?.testimonials?.[1]?.name || "",
        testimonial2_client_type:
          page.testimonials_data?.testimonials?.[1]?.client_type || "",
        testimonial3_text:
          page.testimonials_data?.testimonials?.[2]?.text || "",
        testimonial3_name:
          page.testimonials_data?.testimonials?.[2]?.name || "",
        testimonial3_client_type:
          page.testimonials_data?.testimonials?.[2]?.client_type || "",
        values_title: page.values_data?.title || "",
        value1_icon: page.values_data?.values?.[0]?.icon || "",
        value1_title: page.values_data?.values?.[0]?.title || "",
        value1_description: page.values_data?.values?.[0]?.description || "",
        value2_icon: page.values_data?.values?.[1]?.icon || "",
        value2_title: page.values_data?.values?.[1]?.title || "",
        value2_description: page.values_data?.values?.[1]?.description || "",
        value3_icon: page.values_data?.values?.[2]?.icon || "",
        value3_title: page.values_data?.values?.[2]?.title || "",
        value3_description: page.values_data?.values?.[2]?.description || "",
        value4_icon: page.values_data?.values?.[3]?.icon || "",
        value4_title: page.values_data?.values?.[3]?.title || "",
        value4_description: page.values_data?.values?.[3]?.description || "",
        meta_title: page.meta_title || "",
        meta_description: page.meta_description || "",
        status: page.status || "published",
      });
    }
  }, [page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = page
        ? `/api/admin/cms/pages/${page.id}`
        : "/api/admin/cms/pages";
      const method = page ? "PUT" : "POST";

      // Build philosophy_data from individual fields
      const submissionData = { ...formData };

      // Construct philosophy_data object
      const philosophyData = {
        title:
          submissionData.philosophy_title ||
          "More Than Flowers — We Create Emotions",
        cards: [
          {
            icon: "🎨",
            title: submissionData.philosophy_card1_title || "Artistry",
            description: submissionData.philosophy_card1_description || "",
          },
          {
            icon: "💚",
            title: submissionData.philosophy_card2_title || "Sustainability",
            description: submissionData.philosophy_card2_description || "",
          },
          {
            icon: "✨",
            title: submissionData.philosophy_card3_title || "Excellence",
            description: submissionData.philosophy_card3_description || "",
          },
        ],
      };

      submissionData.philosophy_data = philosophyData;

      // Remove individual philosophy fields from submission
      delete submissionData.philosophy_title;
      delete submissionData.philosophy_card1_title;
      delete submissionData.philosophy_card1_description;
      delete submissionData.philosophy_card2_title;
      delete submissionData.philosophy_card2_description;
      delete submissionData.philosophy_card3_title;
      delete submissionData.philosophy_card3_description;

      // Construct team_data object
      const teamData = {
        title: submissionData.team_title || "Meet Our Passionate Team",
        subtitle:
          submissionData.team_subtitle ||
          "The creative minds and caring hearts behind every Daffodil arrangement",
        members: [
          {
            image_url: submissionData.team_member1_image || null,
            name: submissionData.team_member1_name || "",
            role: submissionData.team_member1_role || "",
            bio: submissionData.team_member1_bio || "",
          },
          {
            image_url: submissionData.team_member2_image || null,
            name: submissionData.team_member2_name || "",
            role: submissionData.team_member2_role || "",
            bio: submissionData.team_member2_bio || "",
          },
          {
            image_url: submissionData.team_member3_image || null,
            name: submissionData.team_member3_name || "",
            role: submissionData.team_member3_role || "",
            bio: submissionData.team_member3_bio || "",
          },
          {
            image_url: submissionData.team_member4_image || null,
            name: submissionData.team_member4_name || "",
            role: submissionData.team_member4_role || "",
            bio: submissionData.team_member4_bio || "",
          },
          {
            image_url: submissionData.team_member5_image || null,
            name: submissionData.team_member5_name || "",
            role: submissionData.team_member5_role || "",
            bio: submissionData.team_member5_bio || "",
          },
        ],
      };

      submissionData.team_data = teamData;

      // Remove individual team fields from submission
      delete submissionData.team_title;
      delete submissionData.team_subtitle;
      delete submissionData.team_member1_image;
      delete submissionData.team_member1_name;
      delete submissionData.team_member1_role;
      delete submissionData.team_member1_bio;
      delete submissionData.team_member2_image;
      delete submissionData.team_member2_name;
      delete submissionData.team_member2_role;
      delete submissionData.team_member2_bio;
      delete submissionData.team_member3_image;
      delete submissionData.team_member3_name;
      delete submissionData.team_member3_role;
      delete submissionData.team_member3_bio;
      delete submissionData.team_member4_image;
      delete submissionData.team_member4_name;
      delete submissionData.team_member4_role;
      delete submissionData.team_member4_bio;
      delete submissionData.team_member5_image;
      delete submissionData.team_member5_name;
      delete submissionData.team_member5_role;
      delete submissionData.team_member5_bio;

      // Construct testimonials_data object
      const testimonialsData = {
        title: submissionData.testimonials_title || "What Our Customers Say",
        testimonials: [
          {
            text: submissionData.testimonial1_text || "",
            name: submissionData.testimonial1_name || "",
            client_type: submissionData.testimonial1_client_type || "",
          },
          {
            text: submissionData.testimonial2_text || "",
            name: submissionData.testimonial2_name || "",
            client_type: submissionData.testimonial2_client_type || "",
          },
          {
            text: submissionData.testimonial3_text || "",
            name: submissionData.testimonial3_name || "",
            client_type: submissionData.testimonial3_client_type || "",
          },
        ],
      };

      submissionData.testimonials_data = testimonialsData;

      // Remove individual testimonials fields from submission
      delete submissionData.testimonials_title;
      delete submissionData.testimonial1_text;
      delete submissionData.testimonial1_name;
      delete submissionData.testimonial1_client_type;
      delete submissionData.testimonial2_text;
      delete submissionData.testimonial2_name;
      delete submissionData.testimonial2_client_type;
      delete submissionData.testimonial3_text;
      delete submissionData.testimonial3_name;
      delete submissionData.testimonial3_client_type;

      // Construct values_data object
      const valuesData = {
        title: submissionData.values_title || "Our Core Values",
        values: [
          {
            icon: submissionData.value1_icon || null,
            title: submissionData.value1_title || "",
            description: submissionData.value1_description || "",
          },
          {
            icon: submissionData.value2_icon || null,
            title: submissionData.value2_title || "",
            description: submissionData.value2_description || "",
          },
          {
            icon: submissionData.value3_icon || null,
            title: submissionData.value3_title || "",
            description: submissionData.value3_description || "",
          },
          {
            icon: submissionData.value4_icon || null,
            title: submissionData.value4_title || "",
            description: submissionData.value4_description || "",
          },
        ],
      };

      submissionData.values_data = valuesData;

      // Remove individual values fields from submission
      delete submissionData.values_title;
      delete submissionData.value1_icon;
      delete submissionData.value1_title;
      delete submissionData.value1_description;
      delete submissionData.value2_icon;
      delete submissionData.value2_title;
      delete submissionData.value2_description;
      delete submissionData.value3_icon;
      delete submissionData.value3_title;
      delete submissionData.value3_description;
      delete submissionData.value4_icon;
      delete submissionData.value4_title;
      delete submissionData.value4_description;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save page");
      }

      toast({
        title: "Success",
        description: page
          ? "Page updated successfully"
          : "Page created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Redirect to pages list
      window.location.href = "/admin/cms/pages";
    } catch (error) {
      console.error("Error saving page:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save page",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="#FFF8F3" p={{ base: 4, md: 6 }}>
      <Flex align="center" justify="space-between" mb={6}>
        <Box>
          <Heading
            size="xl"
            color="#bc0930"
            style={{ fontFamily: "var(--font-rothek)" }}
            mb={1}
          >
            {page ? "Edit Page" : "New Page"}
          </Heading>
          <Text color="#5B6B73" fontSize="sm">
            {page ? "Update page content" : "Create a new static page"}
          </Text>
        </Box>
        <AdminBackButton />
      </Flex>

      <form onSubmit={handleSubmit}>
        <Box
          bg="white"
          borderRadius="16px"
          border="1px solid #F5C7CF"
          p={6}
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Slug</FormLabel>
              <Input
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="about-us"
                disabled={!!page}
              />
              <Text fontSize="xs" color="#5B6B73" mt={1}>
                The URL slug for this page (e.g., /about-us)
              </Text>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="About Us"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Content</FormLabel>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Page content..."
                rows={20}
                resize="vertical"
              />
              <Text fontSize="xs" color="#5B6B73" mt={1}>
                HTML content is supported
              </Text>
            </FormControl>

            <FormControl>
              <FormLabel>Image URL</FormLabel>
              <Input
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                placeholder="/images/shoppage.jpg"
              />
              <Text fontSize="xs" color="#5B6B73" mt={1}>
                URL path to the featured image
              </Text>
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="bold" color="#bc0930" fontSize="lg">
                Philosophy Section
              </FormLabel>
            </FormControl>

            <FormControl>
              <FormLabel>Philosophy Title</FormLabel>
              <Input
                value={formData.philosophy_title}
                onChange={(e) =>
                  setFormData({ ...formData, philosophy_title: e.target.value })
                }
                placeholder="More Than Flowers — We Create Emotions"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="semibold" mt={2}>
                Card 1: Artistry (🎨)
              </FormLabel>
              <Input
                value={formData.philosophy_card1_title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    philosophy_card1_title: e.target.value,
                  })
                }
                placeholder="Artistry"
                mb={2}
              />
              <Textarea
                value={formData.philosophy_card1_description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    philosophy_card1_description: e.target.value,
                  })
                }
                placeholder="Description for artistry card..."
                rows={3}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="semibold" mt={2}>
                Card 2: Sustainability (💚)
              </FormLabel>
              <Input
                value={formData.philosophy_card2_title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    philosophy_card2_title: e.target.value,
                  })
                }
                placeholder="Sustainability"
                mb={2}
              />
              <Textarea
                value={formData.philosophy_card2_description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    philosophy_card2_description: e.target.value,
                  })
                }
                placeholder="Description for sustainability card..."
                rows={3}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="semibold" mt={2}>
                Card 3: Excellence (✨)
              </FormLabel>
              <Input
                value={formData.philosophy_card3_title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    philosophy_card3_title: e.target.value,
                  })
                }
                placeholder="Excellence"
                mb={2}
              />
              <Textarea
                value={formData.philosophy_card3_description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    philosophy_card3_description: e.target.value,
                  })
                }
                placeholder="Description for excellence card..."
                rows={3}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="bold" color="#bc0930" fontSize="lg" mt={4}>
                Team Section
              </FormLabel>
            </FormControl>

            <FormControl>
              <FormLabel>Team Section Title</FormLabel>
              <Input
                value={formData.team_title}
                onChange={(e) =>
                  setFormData({ ...formData, team_title: e.target.value })
                }
                placeholder="Meet Our Passionate Team"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Team Section Subtitle</FormLabel>
              <Input
                value={formData.team_subtitle}
                onChange={(e) =>
                  setFormData({ ...formData, team_subtitle: e.target.value })
                }
                placeholder="The creative minds and caring hearts behind every Daffodil arrangement"
              />
            </FormControl>

            {[1, 2, 3, 4, 5].map((num) => (
              <FormControl key={num}>
                <FormLabel fontWeight="semibold" mt={4}>
                  Team Member {num}
                </FormLabel>
                <Input
                  value={formData[`team_member${num}_image`]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [`team_member${num}_image`]: e.target.value,
                    })
                  }
                  placeholder={`/images/about-us-pictures-members/member${num}.png`}
                  mb={2}
                />
                <Input
                  value={formData[`team_member${num}_name`]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [`team_member${num}_name`]: e.target.value,
                    })
                  }
                  placeholder="Member Name"
                  mb={2}
                />
                <Input
                  value={formData[`team_member${num}_role`]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [`team_member${num}_role`]: e.target.value,
                    })
                  }
                  placeholder="Member Role"
                  mb={2}
                />
                <Textarea
                  value={formData[`team_member${num}_bio`]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [`team_member${num}_bio`]: e.target.value,
                    })
                  }
                  placeholder="Member bio description..."
                  rows={3}
                />
              </FormControl>
            ))}

            <FormControl>
              <FormLabel fontWeight="bold" color="#bc0930" fontSize="lg" mt={4}>
                Testimonials Section
              </FormLabel>
            </FormControl>

            <FormControl>
              <FormLabel>Testimonials Title</FormLabel>
              <Input
                value={formData.testimonials_title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    testimonials_title: e.target.value,
                  })
                }
                placeholder="What Our Customers Say"
              />
            </FormControl>

            {[1, 2, 3].map((num) => (
              <FormControl key={num}>
                <FormLabel fontWeight="semibold" mt={2}>
                  Testimonial {num}
                </FormLabel>
                <Textarea
                  value={formData[`testimonial${num}_text`]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [`testimonial${num}_text`]: e.target.value,
                    })
                  }
                  placeholder="Testimonial text..."
                  rows={4}
                  mb={2}
                />
                <Input
                  value={formData[`testimonial${num}_name`]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [`testimonial${num}_name`]: e.target.value,
                    })
                  }
                  placeholder="Customer Name"
                  mb={2}
                />
                <Input
                  value={formData[`testimonial${num}_client_type`]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [`testimonial${num}_client_type`]: e.target.value,
                    })
                  }
                  placeholder="Client Type (e.g., Wedding Clients)"
                />
              </FormControl>
            ))}

            <FormControl>
              <FormLabel fontWeight="bold" color="#bc0930" fontSize="lg" mt={4}>
                Values Section
              </FormLabel>
            </FormControl>

            <FormControl>
              <FormLabel>Values Title</FormLabel>
              <Input
                value={formData.values_title}
                onChange={(e) =>
                  setFormData({ ...formData, values_title: e.target.value })
                }
                placeholder="Our Core Values"
              />
            </FormControl>

            {[1, 2, 3, 4].map((num) => (
              <FormControl key={num}>
                <FormLabel fontWeight="semibold" mt={2}>
                  Value Item {num}
                </FormLabel>
                <Input
                  value={formData[`value${num}_icon`]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [`value${num}_icon`]: e.target.value,
                    })
                  }
                  placeholder="✨ or /images/home/home3.svg"
                  mb={2}
                />
                <Input
                  value={formData[`value${num}_title`]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [`value${num}_title`]: e.target.value,
                    })
                  }
                  placeholder="Value Title"
                  mb={2}
                />
                <Textarea
                  value={formData[`value${num}_description`]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [`value${num}_description`]: e.target.value,
                    })
                  }
                  placeholder="Value description..."
                  rows={2}
                />
              </FormControl>
            ))}

            <FormControl>
              <FormLabel>Meta Title (SEO)</FormLabel>
              <Input
                value={formData.meta_title}
                onChange={(e) =>
                  setFormData({ ...formData, meta_title: e.target.value })
                }
                placeholder="Leave empty to use page title"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Meta Description (SEO)</FormLabel>
              <Textarea
                value={formData.meta_description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    meta_description: e.target.value,
                  })
                }
                placeholder="A brief description for search engines..."
                rows={3}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </Select>
            </FormControl>

            <Flex justify="flex-end" w="full" pt={4}>
              <Button
                type="submit"
                colorScheme="red"
                bg="#bc0930"
                _hover={{ bg: "#a10828" }}
                isLoading={loading}
                loadingText="Saving..."
              >
                {page ? "Update Page" : "Create Page"}
              </Button>
            </Flex>
          </VStack>
        </Box>
      </form>
    </Box>
  );
}
